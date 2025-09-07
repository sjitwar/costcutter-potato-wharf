import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

interface XMLProduct {
  'effective-start-date': string;
  'supplier-code': string;
  'inner-barcode': string;
  'outer-barcode': string;
  'product-code': string;
  'short-description': string;
  'long-description': string;
  'pack-quantity': string;
  'unit-size': string;
  'unit-description': string;
  'cost-price': string;
  'rsp': string;
  'category': string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  cost_price: number;
  retail_price: number;
  pack_quantity: number;
  unit_size: string;
  unit_description: string;
  barcode: string;
  supplier_code: string;
}

function parseXMLProducts(xmlContent: string): Product[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '_text',
  });

  try {
    const result = parser.parse(xmlContent);
    const products = result['costcutter-response']?.['body']?.['full-download-response']?.products?.product || [];

    const productsArray = Array.isArray(products) ? products : [products];

    return productsArray.map((xmlProduct: XMLProduct, index: number) => {
      // Use the actual category from XML, with some mapping for better UX
      let category = xmlProduct['category'] || 'Other';
      
      // Map XML categories to our UI categories for better organization
      if (category === 'Ice Cream') {
        category = 'Frozen Desserts';
      } else if (category === 'Frozen Ready Meals, Accompaniments & Snacks') {
        category = 'Frozen Ready Meals';
      } else if (category === 'Frozen Vegetables & Vegetarian') {
        category = 'Frozen Vegetables';
      } else if (category === 'Frozen Potato') {
        category = 'Frozen Potatoes';
      } else if (category === 'Frozen Desserts, Fruit & Pastry') {
        category = 'Frozen Desserts';
      } else if (category === 'Ales, Stout & Lager') {
        category = 'Beer';
      } else if (category === 'Flavoured Alcoholic') {
        category = 'Alcoholic Beverages';
      } else if (category === 'Fortified Wines') {
        category = 'Wine';
      } else if (category === 'Crisps Snacks & Nuts') {
        category = 'Snacks';
      } else if (category === 'Seasonal & Boxed Confectionery') {
        category = 'Confectionery';
      } else if (category === 'Chilled Prepared/Convenience Foods') {
        category = 'Chilled Foods';
      } else if (category === 'Fresh Meat & Poultry') {
        category = 'Fresh Meat';
      } else if (category === 'Fresh Bread & Morning Goods') {
        category = 'Fresh Bread';
      } else if (category === 'Fresh Milk & Cream') {
        category = 'Fresh Dairy';
      } else if (category === 'Fresh Fish') {
        category = 'Fresh Fish';
      } else if (category === 'Fresh Produce') {
        category = 'Fresh Produce';
      } else if (category === 'Frozen Meat & Poultry') {
        category = 'Frozen Meat';
      } else if (category === 'Canned & Packet Foods') {
        category = 'Canned Foods';
      } else if (category === 'Hot Beverages') {
        category = 'Hot Drinks';
      } else if (category === 'Breakfast Cereal') {
        category = 'Cereals';
      } else if (category === 'Home Baking and Desserts') {
        category = 'Baking';
      } else if (category === 'Cooking Ingredients') {
        category = 'Cooking';
      } else if (category === 'Jams & Spreads') {
        category = 'Spreads';
      } else if (category === 'International Foods') {
        category = 'International';
      } else if (category === 'Food To Go') {
        category = 'Food To Go';
      } else if (category === 'Toiletries & Beauty') {
        category = 'Toiletries';
      } else if (category === 'Healthcare') {
        category = 'Healthcare';
      } else if (category === 'Homecare') {
        category = 'Homecare';
      } else if (category === 'Laundry') {
        category = 'Laundry';
      } else if (category === 'Paperware') {
        category = 'Paperware';
      } else if (category === 'Petcare') {
        category = 'Petcare';
      } else if (category === 'Baby Care') {
        category = 'Baby Care';
      } else if (category === 'Smoking Alternative') {
        category = 'Smoking';
      } else if (category === 'Cigarettes') {
        category = 'Cigarettes';
      } else if (category === 'Cigars') {
        category = 'Cigars';
      } else if (category === 'Tobacco') {
        category = 'Tobacco';
      } else if (category === 'Smoking Accessories') {
        category = 'Smoking Accessories';
      } else if (category === 'Stationery & Wrap') {
        category = 'Stationery';
      } else if (category === 'Home & Dining') {
        category = 'Home & Dining';
      } else if (category === 'Outdoor & Leisure') {
        category = 'Outdoor & Leisure';
      } else if (category === 'Motor & DIY') {
        category = 'Motor & DIY';
      } else if (category === 'Batteries & Lightbulbs') {
        category = 'Batteries & Lightbulbs';
      } else if (category === 'Business Consumables') {
        category = 'Business';
      } else if (category === 'Domestic Fuel') {
        category = 'Fuel';
      } else if (category === 'Frozen Savoury Pastry') {
        category = 'Frozen Pastry';
      }

      // Generate a placeholder image URL based on category
      const imageUrls: Record<string, string> = {
        'Frozen Desserts': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200',
        'Frozen Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
        'Frozen Potatoes': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
        'Frozen Fish': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
        'Frozen Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
        'Frozen Ready Meals': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
        'Frozen Meat': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
        'Frozen Pastry': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200',
        'Spirits': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
        'Beer': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200',
        'Wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200',
        'Cider': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200',
        'Alcoholic Beverages': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200',
        'Soft Drinks': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200',
        'Hot Drinks': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200',
        'Confectionery': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
        'Snacks': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
        'Biscuits': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
        'Chilled Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
        'Chilled Foods': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
        'Fresh Meat': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200',
        'Fresh Fish': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200',
        'Fresh Produce': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
        'Fresh Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
        'Fresh Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
        'Canned Foods': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Cereals': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Baking': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
        'Cooking': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Spreads': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'International': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Food To Go': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Toiletries': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Healthcare': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Homecare': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Laundry': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Paperware': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Petcare': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Baby Care': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Smoking': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Cigarettes': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Cigars': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Tobacco': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Smoking Accessories': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Stationery': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Home & Dining': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Outdoor & Leisure': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Motor & DIY': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Batteries & Lightbulbs': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Business': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Fuel': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        'Other': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
      };

      return {
        id: `${xmlProduct['product-code'] || 'unknown'}-${xmlProduct['supplier-code'] || 'supplier'}-${index}`,
        name: xmlProduct['short-description'] || 'Unknown Product',
        category,
        description: xmlProduct['long-description'] || xmlProduct['short-description'] || 'No description available',
        image_url: imageUrls[category] || imageUrls.Other,
        cost_price: parseFloat(xmlProduct['cost-price'] || '0'),
        retail_price: parseFloat(xmlProduct['rsp'] || '0'),
        pack_quantity: parseInt(xmlProduct['pack-quantity'] || '0'),
        unit_size: xmlProduct['unit-size'] || '',
        unit_description: xmlProduct['unit-description'] || '',
        barcode: xmlProduct['inner-barcode'] || '',
        supplier_code: xmlProduct['supplier-code'] || '',
      };
    });
  } catch (error) {
    console.error('Error parsing XML:', error);
    return [];
  }
}

async function importProducts() {
  try {
    console.log('🚀 Starting product import...');
    
    // Read XML file
    const xmlPath = path.join(__dirname, '../public/2025_Jul_01_15_31_14__PacificPlof.xml');
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');
    
    // Parse products
    console.log('📄 Parsing XML...');
    const products = parseXMLProducts(xmlContent);
    console.log(`✅ Parsed ${products.length} products`);
    
    // Clear existing products (optional - remove if you want to keep existing data)
    console.log('🗑️ Clearing existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', 'dummy'); // Delete all products
    
    if (deleteError) {
      console.warn('⚠️ Could not clear existing products:', deleteError.message);
    }
    
    // Insert products in batches
    const batchSize = 1000;
    let imported = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      console.log(`📦 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}...`);
      
      const { error } = await supabase
        .from('products')
        .insert(batch);
      
      if (error) {
        console.error('❌ Error importing batch:', error);
        throw error;
      }
      
      imported += batch.length;
      console.log(`✅ Imported ${imported}/${products.length} products`);
    }
    
    console.log('🎉 Product import completed successfully!');
    console.log(`📊 Total products imported: ${imported}`);
    
    // Get some statistics
    const { data: stats } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
    
    const categoryCounts = stats?.reduce((acc: Record<string, number>, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Category breakdown:');
    Object.entries(categoryCounts || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importProducts();
}

export { importProducts };
