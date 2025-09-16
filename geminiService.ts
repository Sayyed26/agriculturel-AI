
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { Zone, SoilTest, WeatherData, AiRecommendation, CropHealthAnalysis } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for environments where the key is not set.
  // In a real deployed application, this variable should be set.
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
  process.env.API_KEY = "mock-api-key-for-development";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        irrigation: {
            type: Type.OBJECT,
            properties: {
                needed: { type: Type.BOOLEAN, description: "Is irrigation needed?" },
                amount: { type: Type.NUMBER, description: "Recommended water amount in millimeters (mm).", nullable: true },
                duration: { type: Type.NUMBER, description: "Recommended irrigation duration in minutes, assuming standard flow rate.", nullable: true },
                reason: { type: Type.STRING, description: "A concise reason for the irrigation recommendation." }
            },
            required: ["needed", "reason"],
        },
        fertilizer: {
            type: Type.OBJECT,
            properties: {
                needed: { type: Type.BOOLEAN, description: "Is fertilizer application needed?" },
                type: { type: Type.STRING, description: "The primary nutrient needed (e.g., Nitrogen, Phosphorus, Potassium).", nullable: true },
                amount: { type: Type.NUMBER, description: "Recommended amount in kilograms per acre (kg/acre).", nullable: true },
                reason: { type: Type.STRING, description: "A concise reason for the fertilizer recommendation." }
            },
            required: ["needed", "reason"],
        },
    },
    required: ["irrigation", "fertilizer"],
};

const cropHealthSchema = {
    type: Type.OBJECT,
    properties: {
        condition: {
            type: Type.STRING,
            description: "The primary condition identified (e.g., 'Healthy', 'Nitrogen Deficiency', 'Powdery Mildew')."
        },
        confidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0 to 1 for the identified condition."
        },
        description: {
            type: Type.STRING,
            description: "A brief description of the condition and its typical symptoms."
        },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "A list of actionable recommendations for treatment or management."
        }
    },
    required: ["condition", "confidence", "description", "recommendations"]
};


export const getFarmingRecommendation = async (
  zone: Zone,
  soilTest: SoilTest,
  weather: WeatherData
): Promise<AiRecommendation> => {
    
  if (process.env.API_KEY === "mock-api-key-for-development") {
    return new Promise(resolve => setTimeout(() => resolve({
        irrigation: {
          needed: true,
          amount: 25,
          duration: 60,
          reason: "Soil is dry and no rain is forecast for the next 48 hours. Mocked response."
        },
        fertilizer: {
          needed: true,
          type: "Nitrogen",
          amount: 20,
          reason: "Crop is in its growth stage and soil test shows low nitrogen levels. Mocked response."
        }
    }), 1500));
  }

  const prompt = `
    Analyze the following agricultural data for a specific zone and provide an actionable recommendation for irrigation and fertilization.

    **Zone and Crop Details:**
    - Zone Type: ${zone.type}
    - Crop: ${zone.crop?.name || 'N/A'} (${zone.crop?.variety || 'N/A'})
    - Sowing Date: ${zone.crop?.sowingDate || 'N/A'}
    - Current Stage: Assume it's in a mid-growth vegetative stage.
    - Zone Area: ${zone.area} acres

    **Latest Soil Test Results (from ${soilTest.sampleDate}):**
    - pH: ${soilTest.ph}
    - Nitrogen (N): ${soilTest.nitrogen} ppm
    - Phosphorus (P): ${soilTest.phosphorus} ppm
    - Potassium (K): ${soilTest.potassium} ppm
    - Organic Matter: ${soilTest.organicMatter}%

    **Current and Forecasted Weather:**
    - Current Temperature: ${weather.temperature}°C
    - Current Humidity: ${weather.humidity}%
    - Precipitation in last 24h: ${weather.precipitation} mm
    - Forecast for next 3 days: 
      - ${weather.forecast[0].day}: ${weather.forecast[0].temp}°C
      - ${weather.forecast[1].day}: ${weather.forecast[1].temp}°C
      - ${weather.forecast[2].day}: ${weather.forecast[2].temp}°C
      (Assume no rain is forecast unless precipitation is mentioned as high)

    **Task:**
    Based on all the provided data, determine if irrigation and/or fertilizer application is necessary today.
    - For irrigation, consider the recent precipitation and upcoming forecast.
    - For fertilizer, consider the crop's growth stage and the soil nutrient levels.
    
    Provide a JSON response with your recommendations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    return parsedJson as AiRecommendation;

  } catch (error) {
    console.error("Error fetching Gemini recommendation:", error);
    throw new Error("Failed to get AI recommendation. Please check your API key and network connection.");
  }
};

export const analyzeCropImage = async (base64Image: string, mimeType: string): Promise<CropHealthAnalysis> => {
    if (process.env.API_KEY === "mock-api-key-for-development") {
        return new Promise(resolve => setTimeout(() => resolve({
            condition: "Nitrogen Deficiency (Mocked)",
            confidence: 0.85,
            description: "The yellowing of the leaves, particularly in a V-shape starting from the tip, is a classic symptom of nitrogen deficiency in corn.",
            recommendations: [
                "Apply a nitrogen-rich fertilizer immediately.",
                "Consider side-dressing with Urea (46-0-0) or UAN (28-0-0).",
                "Perform a follow-up soil test in 2-3 weeks to monitor nutrient levels."
            ]
        }), 2000));
    }

    const prompt = "Analyze the provided image of a crop leaf. Identify any visible signs of disease, pests, or nutrient deficiencies. Provide your analysis in a structured JSON format.";
    
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };
        const textPart = { text: prompt };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: cropHealthSchema
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as CropHealthAnalysis;

    } catch (error) {
        console.error("Error analyzing crop image:", error);
        throw new Error("Failed to analyze image. Please try again.");
    }
};
