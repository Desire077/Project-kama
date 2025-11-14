const Payment = require('../models/Payment')
const Property = require('../models/Property')
const User = require('../models/User')
const crypto = require('crypto')

// Generate a short reference code
function genRef(){
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// POST /api/payments/manual/initiate
exports.initiate = async (req, res) => {
  try{
    const { propertyId, amount, currency = 'XAF' } = req.body
    if(!propertyId || !amount) return res.status(400).json({ message: 'propertyId and amount required' })

    const property = await Property.findById(propertyId)
    if(!property) return res.status(404).json({ message: 'Property not found' })

    const reference = genRef()
    const recipientPhone = process.env.MERCHANT_PHONE || '0000000000' // admin number to receive funds

    const payment = await Payment.create({
      user: req.user ? req.user.id : null,
      property: propertyId,
      method: 'airtel',
      amount,
      currency,
      recipientPhone,
      reference,
      status: 'pending'
    })

    return res.status(201).json({ message: 'Initiated', payment: { id: payment._id, reference, recipientPhone } })
  }catch(err){
    console.error('Initiate manual payment error', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// POST /api/payments/manual/submit
// Body: { paymentId, senderPhone, transactionRef }
exports.submit = async (req, res) => {
  try{
    const { paymentId, senderPhone, transactionRef } = req.body
    if(!paymentId || !senderPhone) return res.status(400).json({ message: 'paymentId and senderPhone required' })

    const payment = await Payment.findById(paymentId)
    if(!payment) return res.status(404).json({ message: 'Payment not found' })

    payment.senderPhone = senderPhone
    payment.transactionRef = transactionRef
    payment.status = 'submitted'
    payment.submittedAt = new Date()
    await payment.save()

    return res.json({ message: 'Payment submitted', payment })
  }catch(err){
    console.error('Submit manual payment error', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// POST /api/payments/manual/confirm (admin)
// Body: { paymentId, confirm: true }
exports.confirm = async (req, res) => {
  try{
    const { paymentId, confirm } = req.body
    if(!paymentId) return res.status(400).json({ message: 'paymentId required' })

    const payment = await Payment.findById(paymentId)
    if(!payment) return res.status(404).json({ message: 'Payment not found' })

    if(confirm){
      payment.status = 'confirmed'
      payment.confirmedAt = new Date()
      payment.confirmedBy = req.user.id
      await payment.save()

      // Update property status to 'online' (or as business rule)
      if(payment.property){
        await Property.findByIdAndUpdate(payment.property, { status: 'online' })
      }

      return res.json({ message: 'Payment confirmed', payment })
    }else{
      payment.status = 'failed'
      await payment.save()
      return res.json({ message: 'Payment marked as failed', payment })
    }
  }catch(err){
    console.error('Confirm manual payment error', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// GET /api/payments/manual/list (admin)
exports.list = async (req, res) => {
  try{
    const { status, page = 1, limit = 50 } = req.query
    const filter = { method: 'airtel' }
    if(status) filter.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const payments = await Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'firstName lastName email').populate('property', 'title')
    const total = await Payment.countDocuments(filter)
    return res.json({ payments, total, page: Number(page), limit: Number(limit) })
  }catch(err){
    console.error('List manual payments error', err)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
