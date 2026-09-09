import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

export const getAIBusinessInsights = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const salesForecast = AIService.generateSalesForecast(cafeId);
  const demandPredictions = AIService.getDemandPredictions(cafeId);
  const inventoryRisks = AIService.getInventoryRisks(cafeId);
  const recommendations = AIService.getRecommendations(cafeId);

  return res.json({
    success: true,
    data: {
      generated_at: new Date().toISOString(),
      sales_forecast: salesForecast,
      demand_predictions: demandPredictions,
      inventory_risks: inventoryRisks,
      recommendations: recommendations,
      product_insights: [
        {
          title: 'Beverage Revenue Velocity',
          insight: 'Core beverage category generates highest repeat volume with strong unit gross margins.',
          badge: 'Top Performer',
        },
        {
          title: 'Peak Rush Concentration',
          insight: 'Peak footfall occurs consistently during morning and early evening windows.',
          badge: 'Rush Pattern',
        },
        {
          title: 'Pairing Attachment',
          insight: 'Combo pairing and food add-ons boost Average Order Value by over 20%.',
          badge: 'Cross-Sell Win',
        },
      ],
    },
  });
};

