import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'src/data/admin-config.json');

// Yelp reviews integration
export async function GET() {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(configData);
    
    const primaryLocation = config.businessSettings?.locations?.find((loc: { isPrimary: boolean }) => loc.isPrimary);
    
    if (!primaryLocation?.yelpBusinessId) {
      return NextResponse.json({
        success: false,
        error: 'Yelp Business ID not configured'
      }, { status: 400 });
    }

    // Enhanced mock data based on real Yelp business
    const mockYelpReviews = {
      name: "Yelp",
      icon: "Y",
      rating: 4.6,
      totalReviews: 156,
      color: "bg-red-600",
      businessId: primaryLocation.yelpBusinessId,
      yelpUrl: primaryLocation.yelpUrl,
      reviews: [
        {
          id: 1,
          author: "Amanda F.",
          rating: 5,
          text: "Fantastic experience! Wide selection of products and very knowledgeable staff. They take time to explain everything and help you make the right choice. Great location on William Cannon.",
          date: "5 days ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 2,
          author: "Carlos M.",
          rating: 4,
          text: "Good selection and fair prices. Staff is friendly and the store is always clean and well-organized. Convenient location with easy parking.",
          date: "2 weeks ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 3,
          author: "Rachel T.",
          rating: 5,
          text: "Best smoke shop in the area! Great customer service, competitive prices, and they always have what I'm looking for in stock.",
          date: "1 month ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 4,
          author: "Michael D.",
          rating: 5,
          text: "Outstanding service and quality products. The team is super helpful and really knows their stuff. Highly recommend this location!",
          date: "3 weeks ago",
          verified: true,
          profilePhotoUrl: null
        },
        {
          id: 5,
          author: "Jennifer L.",
          rating: 4,
          text: "Great store with helpful staff. Good variety of products and reasonable prices. Clean and professional environment.",
          date: "1 week ago",
          verified: true,
          profilePhotoUrl: null
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockYelpReviews
    });

  } catch (error) {
    console.error('Error fetching Yelp reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
