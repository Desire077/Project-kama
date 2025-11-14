// tests/subscriptionMiddleware.test.js
const { requirePremium, requirePlan, requireActiveSubscription } = require('../middlewares/subscriptionMiddleware');

// Mock request and response objects
const createMockReq = (user) => ({
  user: user || { id: 'test-user-id' }
});

const createMockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  };
  return res;
};

// Mock next function
const next = jest.fn();

// Mock User model
jest.mock('../models/User', () => {
  return {
    findById: jest.fn()
  };
});

const User = require('../models/User');

describe('Subscription Middleware Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requirePremium', () => {
    it('should allow access for users with active subscription', async () => {
      const req = createMockReq({ id: 'test-user-id' });
      const res = createMockRes();
      
      // Mock user with active subscription
      User.findById.mockResolvedValue({
        _id: 'test-user-id',
        subscription: {
          active: true,
          plan: 'premium'
        }
      });
      
      await requirePremium(req, res, next);
      
      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(next).toHaveBeenCalled();
      expect(req.user.subscription).toBeDefined();
    });

    it('should deny access for users without active subscription', async () => {
      const req = createMockReq({ id: 'test-user-id' });
      const res = createMockRes();
      
      // Mock user without active subscription
      User.findById.mockResolvedValue({
        _id: 'test-user-id',
        subscription: {
          active: false
        }
      });
      
      await requirePremium(req, res, next);
      
      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Accès réservé aux membres premium.',
        code: 'PREMIUM_REQUIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      const req = createMockReq({ id: 'test-user-id' });
      const res = createMockRes();
      
      // Mock user not found
      User.findById.mockResolvedValue(null);
      
      await requirePremium(req, res, next);
      
      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Utilisateur non trouvé.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requirePlan', () => {
    it('should allow access for users with required plan', async () => {
      const req = createMockReq({ id: 'test-user-id' });
      const res = createMockRes();
      
      // Mock user with required plan
      User.findById.mockResolvedValue({
        _id: 'test-user-id',
        subscription: {
          active: true,
          plan: 'premium'
        }
      });
      
      await requirePlan('premium')(req, res, next);
      
      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(next).toHaveBeenCalled();
      expect(req.user.subscription).toBeDefined();
    });

    it('should deny access for users without required plan', async () => {
      const req = createMockReq({ id: 'test-user-id' });
      const res = createMockRes();
      
      // Mock user with different plan
      User.findById.mockResolvedValue({
        _id: 'test-user-id',
        subscription: {
          active: true,
          plan: 'basic'
        }
      });
      
      await requirePlan('premium')(req, res, next);
      
      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Accès réservé aux membres avec la formule premium.',
        code: 'PLAN_REQUIRED',
        requiredPlan: 'premium'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireActiveSubscription', () => {
    it('should allow access for users with valid subscription', async () => {
      const req = createMockReq({ id: 'test-user-id' });
      const res = createMockRes();
      
      // Mock user with valid subscription
      User.findById.mockResolvedValue({
        _id: 'test-user-id',
        subscription: {
          active: true,
          plan: 'premium',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
        }
      });
      
      await requireActiveSubscription(req, res, next);
      
      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(next).toHaveBeenCalled();
      expect(req.user.subscription).toBeDefined();
    });

    it('should deny access for users with expired subscription', async () => {
      const req = createMockReq({ id: 'test-user-id' });
      const res = createMockRes();
      
      // Mock user with expired subscription
      User.findById.mockResolvedValue({
        _id: 'test-user-id',
        subscription: {
          active: true,
          plan: 'premium',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      });
      
      await requireActiveSubscription(req, res, next);
      
      expect(User.findById).toHaveBeenCalledWith('test-user-id');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Votre abonnement a expiré.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});