// This file is now the single source of truth for our tabs, images, AND interactive hotspots.

export const tabConfig = [
    {
      id: 'exterior',
      title: 'Exterior',
      categoryName: 'Exterior Color',
      imageUrl: 'https://static0.carbuzzimages.com/wordpress/wp-content/uploads/gallery-images/original/1032000/300/1032399.jpg',
      // NEW: An array of hotspot objects for this specific image.
      // Positions are in percentages to be responsive.
      hotspots: [
        { id: 'ext-paint', name: 'Main Body Paint', top: '30%', left: '25%', width: '50%', height: '40%' },
        { id: 'ext-lights', name: 'Headlights', top: '45%', left: '80%', width: '15%', height: '10%' },
      ]
    },
    {
      id: 'wheels',
      title: 'Wheels',
      categoryName: 'Wheel Style',
      imageUrl: 'https://projectkahn.com/cdn/shop/files/cutout_Silver_72385ec3-bfbf-44ed-bd65-d36c07947ea3.webp?v=1699462862',
      hotspots: [
        { id: 'whl-front', name: 'Front Wheel Assembly', top: '15%', left: '8%', width: '85%', height: '80%' }
      ]
    },
    {
      id: 'interior',
      title: 'Interior',
      categoryName: 'Interior Trim',
      imageUrl: 'https://s1.cdn.autoevolution.com/images/news/tuner-brings-out-the-color-within-the-ferrari-458-interior-work-is-off-the-scale-213410-7.jpg',
      hotspots: [
        { id: 'int-steering', name: 'Steering Wheel & Driver Zone', top: '20%', left: '35%', width: '30%', height: '55%' },
        { id: 'int-seats', name: 'Passenger Seats', top: '30%', left: '65%', width: '30%', height: '60%' }
      ]
    }
  ];