import { Request, Response } from 'express';
import { AIService } from '../services/aiService';

export const getAIBusinessInsights = (req: Request, res: Response) => {
  const salesForecast = AIService.generateSalesForecast();
  const demandPredictions = AIService.getDemandPredictions();
  const inventoryRisks = AIService.getInventoryRisks();
  const recommendations = AIService.getRecommendations();

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
          title: 'Cold Coffee Revenue Share',
          insight: 'Cold Coffee generated 18.4% of total beverage revenue this week with an impressive 78% gross margin.',
          badge: 'Top Performer',
        },
        {
          title: 'Morning Rush Concentration',
          insight: 'Cappuccino & Espresso account for 64% of all orders placed between 8:30 AM and 11:30 AM.',
          badge: 'Rush Pattern',
        },
        {
          title: 'Food Pairing Attachment',
          insight: '29% of customers ordering tea or coffee also added a Sandwich or Brownie.',
          badge: 'Cross-Sell Win',
        },
      ],
    },
  });
};
