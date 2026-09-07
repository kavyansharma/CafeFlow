import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';
import { CAFE_SUNRISE_ID } from '../database/seedData';

export const getAIBusinessInsights = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;

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
          insight: 'Core beverage category generates over 65% of total revenue with strong unit gross margins.',
          badge: 'Top Performer',
        },
        {
          title: 'Peak Rush Concentration',
          insight: 'Peak footfall occurs consistently during morning and early evening windows.',
          badge: 'Rush Pattern',
        },
        {
          title: 'Pairing Attachment',
          insight: 'Combo pairing and add-ons boost Average Order Value by 24.5%.',
          badge: 'Cross-Sell Win',
        },
      ],
    },
  });
};
