const { MongoClient } = require('mongodb');

const SEED_PRODUCTS = [
  // FOOD
  {
    name: 'Premium Puppy Kibble',
    description: 'Ancient Grains & Organic Chicken • 5kg',
    price: 3360,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9a36abb?w=400'
  },
  {
    name: 'Royal Canine Feast',
    description: 'Grain-Free Lamb & Sweet Potato • 3kg',
    price: 2799,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'
  },
  {
    name: 'Feline Delight Mix',
    description: 'Ocean Fish & Chicken Blend • 2kg',
    price: 1899,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'
  },
  {
    name: 'Adult Cat Ocean Fish',
    description: 'Wild-Caught Salmon & Brown Rice • 4kg',
    price: 2500,
    category: 'Food',
    image: 'https://loremflickr.com/400/400/pet,food?lock=1'
  },
  {
    name: 'Kitten Wellness Pate',
    description: 'Tender Chicken & Liver Recipe • 12 cans',
    price: 1450,
    category: 'Food',
    image: 'https://loremflickr.com/400/400/pet,food?lock=2'
  },
  {
    name: 'Senior Dog Joint Diet',
    description: 'Low-Fat Turkey with Glucosamine • 3kg',
    price: 2900,
    category: 'Food',
    image: 'https://loremflickr.com/400/400/pet,food?lock=3'
  },

  // ACCESSORIES
  {
    name: 'Ergonomic Pet Bed',
    description: 'Orthopedic memory foam for all pets',
    price: 4500,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,bed?lock=1'
  },
  {
    name: 'Premium Leather Collar',
    description: 'Handcrafted genuine leather with brass fittings',
    price: 1200,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,collar?lock=1'
  },
  {
    name: 'Interactive Puzzle Toy',
    description: 'Mental stimulation for curious minds',
    price: 850,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,toy?lock=1'
  },
  {
    name: 'Auto-Refill Water Dispenser',
    description: 'Gravity-fed 2L capacity',
    price: 1400,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,bowl?lock=1'
  },
  {
    name: 'Travel Carrier Bag',
    description: 'Airline approved, breathable mesh design',
    price: 3200,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,carrier?lock=1'
  },
  {
    name: 'Durable Chew Ring',
    description: 'Tough rubber toy for aggressive chewers',
    price: 600,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/dog,toy?lock=2'
  },

  // HEALTH
  {
    name: 'Vita-Pet Supplement',
    description: 'Multi-Vitamin Chews for All Breeds • 60 pcs',
    price: 1299,
    category: 'Health',
    image: 'https://images.unsplash.com/photo-1582797493098-23d8d0cc6769?w=400'
  },
  {
    name: 'ZenBites Calming Chews',
    description: 'Natural relief for travel and storms • 30ct',
    price: 2280,
    category: 'Health',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzhDuHxXgN4VO2N7nJrENh8IA9cc2NrKGm6AfSgNzEs_75fjCtLNvI9Gt6E5_S2m5AWmKxOUIiWGphzbLYJdTXsQ7WcrW42vjU6Mp_IaMSw_ZNzNdoL-R8eXi7XRRSI2GwPpi7pA2LaKQvLzRF7KseLCowOuxgI8wIa7PPE-zb6MNRSZvdrYwrpO9sJT7XheRQHQ8SI5RpuY5Y196lLJBHZJiVpKSIJIOJ26XV9KuhPVWOqrtXwx4IUeXU5RZTVDkeZbBrp9q5L0Q'
  },
  {
    name: 'Lavender Fur Mist',
    description: 'Deodorizing spray with organic oils • 250ml',
    price: 1520,
    category: 'Health',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCthByd8p3LLoN8-GrKevsckA8JSBQ85_W9kRt7VirIWH8AQAqeMYhuqyFkR-Opm_y5RE5fG9QVNC5UQzkMalxpPli8u1tN-PEHDi08FsT9CglKSsIzI4M96XSTYuqeitxX70LIWGR7TzRkAJzeuhWlGOyJ9PblxnlfN46F29kRsGogGjTTx7J0AqCPqQ3ndB3bCdhG-GfrdrKM97kNFOvBnROTrY2arnGQD9jymYFbnX_I9DF-mcRdqAKmNTppQfVrtPCAM4ZorxY'
  },
  {
    name: 'Dental Care Water Additive',
    description: 'Helps fight plaque and tartar • 500ml',
    price: 1100,
    category: 'Health',
    image: 'https://loremflickr.com/400/400/pet,health?lock=1'
  },
  {
    name: 'Flea & Tick Prevention',
    description: 'Once a month topical treatment',
    price: 2150,
    category: 'Health',
    image: 'https://loremflickr.com/400/400/pet,health?lock=2'
  },
  {
    name: 'Soothing Paw Balm',
    description: 'Moisturizes rough and cracked paw pads',
    price: 950,
    category: 'Health',
    image: 'https://loremflickr.com/400/400/pet,health?lock=3'
  }
];

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('pet_care');
    const col = db.collection('products');
    await col.drop().catch(() => {}); // Optional if already dropped
    await col.insertMany(SEED_PRODUCTS.map(p => ({ ...p, createdAt: new Date() })));
    console.log("Database reseeded successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
