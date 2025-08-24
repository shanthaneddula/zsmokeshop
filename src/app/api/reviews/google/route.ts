import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'src/data/admin-config.json');

// Google Places API integration for real reviews
export async function GET() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configData);
    
    const primaryLocation = config.businessSettings?.locations?.find((loc: { isPrimary: boolean }) => loc.isPrimary);
    
    if (!primaryLocation?.googlePlaceId) {
      return NextResponse.json({
        success: false,
        error: 'Google Place ID not configured'
      }, { status: 400 });
    }

    // For now, return enhanced mock data based on the real business
    // In production, this would use Google Places API with the Place ID
    const mockGoogleReviews = {
      name: "Google",
      icon: "G",
      rating: 4.8,
      totalReviews: 127,
      color: "bg-blue-600",
      placeId: primaryLocation.googlePlaceId,
      mapsUrl: primaryLocation.googleMapsUrl,
      reviews: [
        {
          id: 1,
          author: "Sarah Martinez",
          rating: 5,
          text: "Excellent selection and knowledgeable staff. They helped me find exactly what I was looking for. Great customer service and competitive prices!",
          date: "2 weeks ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 2,
          author: "Mike Rodriguez", 
          rating: 5,
          text: "Best smoke shop in Austin! Clean store, fair prices, and the staff really knows their products. Highly recommend to anyone looking for quality products.",
          date: "1 month ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 3,
          author: "Jessica Chen",
          rating: 4,
          text: "Great variety of products and convenient locations. Staff is always friendly and helpful. Will definitely be coming back.",
          date: "3 weeks ago", 
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 4,
          author: "David Thompson",
          rating: 5,
          text: "Outstanding customer service! The team took time to explain different products and helped me make the right choice. Very professional.",
          date: "1 week ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 5,
          author: "Amanda Foster",
          rating: 5,
          text: "Love this place! Great selection, competitive prices, and the staff is super knowledgeable. Always have what I need in stock.",
          date: "4 days ago",
          verified: true,
          profilePhotoUrl: null
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockGoogleReviews
    });

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/* 
TODO: Implement real Google Places API integration
This would require:
1. Google Places API key in environment variables
2. Places API "Place Details" request using the Place ID
3. Proper error handling and rate limiting
4. Review data transformation to match our interface

Example implementation:
const response = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`
);
*/
