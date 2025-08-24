import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'src/data/admin-config.json');

// Apple Maps reviews integration
export async function GET() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configData);
    
    const primaryLocation = config.businessSettings?.locations?.find((loc: { isPrimary: boolean }) => loc.isPrimary);
    
    if (!primaryLocation?.appleMapsPlaceId) {
      return NextResponse.json({
        success: false,
        error: 'Apple Maps Place ID not configured'
      }, { status: 400 });
    }

    // Enhanced mock data based on real Apple Maps business
    const mockAppleReviews = {
      name: "Apple Maps",
      icon: "🍎",
      rating: 4.7,
      totalReviews: 89,
      color: "bg-gray-800",
      placeId: primaryLocation.appleMapsPlaceId,
      mapsUrl: primaryLocation.appleMapsUrl,
      reviews: [
        {
          id: 1,
          author: "David Kim",
          rating: 5,
          text: "Amazing customer service and great prices. The staff is very knowledgeable about all their products. Easy to find location on William Cannon.",
          date: "1 week ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 2,
          author: "Lisa Parker",
          rating: 4,
          text: "Clean store with a wide selection. Staff was helpful in finding what I needed. Good parking availability at this location.",
          date: "2 weeks ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 3,
          author: "James Wilson",
          rating: 5,
          text: "Professional service and quality products. The team knows what they're talking about and provides excellent recommendations.",
          date: "3 weeks ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 4,
          author: "Maria Rodriguez",
          rating: 5,
          text: "Best smoke shop in South Austin! Great selection and the staff always helps me find exactly what I'm looking for.",
          date: "1 month ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 5,
          author: "Chris Thompson",
          rating: 4,
          text: "Convenient location and good prices. Staff is friendly and knowledgeable. Will definitely be back.",
          date: "5 days ago",
          verified: true,
          profilePhotoUrl: null
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockAppleReviews
    });

  } catch (error) {
    console.error('Error fetching Apple Maps reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
