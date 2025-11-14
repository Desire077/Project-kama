import React, { useEffect, useState } from 'react'
import { fetchManualPayments, confirmManualPayment } from '../api/adminClient'
import { useSelector } from 'react-redux'

export default function AdminPayments(){
  const auth = useSelector(state => state.auth)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=>{
    if(!auth.user || auth.user.role !== 'admin') return
    load()
  }, [auth.user])

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await fetchManualPayments()
      setPayments(res.data.payments)
    }catch(e){
      setError('Erreur lors du chargement')
    }finally{ setLoading(false) }
  }

  const handleConfirm = async (id, confirm) => {
    try{
      await confirmManualPayment(id, confirm)
      load()
    }catch(e){ setError('Erreur lors de la confirmation') }
  }

  if(!auth.user) return <div className="p-4">Accès refusé</div>
  if(auth.user.role !== 'admin') return <div className="p-4">Accès réservé à l'admin</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Paiements manuels</h2>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && payments.length === 0 && <div>Aucun paiement</div>}
      <ul>
        {payments.map(p => (
          <li key={p._id} className="border p-3 mb-2">
            <div><strong>Réf:</strong> {p.reference} <strong>Statut:</strong> {p.status}</div>
            <div><strong>Montant:</strong> {p.amount} {p.currency} <strong>Propriété:</strong> {p.property?.title || '—'}</div>
            <div><strong>Expéditeur:</strong> {p.senderPhone || '—'} <strong>Dest:</strong> {p.recipientPhone}</div>
            <div className="mt-2">
              <button onClick={()=>handleConfirm(p._id, true)} className="mr-2 px-3 py-1 bg-green-600 text-white rounded">Confirmer</button>
              <button onClick={()=>handleConfirm(p._id, false)} className="px-3 py-1 bg-red-600 text-white rounded">Marquer échoué</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
