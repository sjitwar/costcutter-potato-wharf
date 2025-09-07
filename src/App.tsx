import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { ShoppingCart } from 'lucide-react';
import ProductSearch from './components/ProductSearch';
import ProductList from './components/ProductList';
import VotingSection from './components/VotingSection';
import { supabase } from './lib/supabase';
import './App.css';

// Create a theme for the app
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green color for grocery store theme
    },
    secondary: {
      main: '#ff6f00', // Orange accent
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Product interface (now matches Supabase schema)
export interface Product {
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
  vote_count?: number;
  user_has_voted?: boolean;
}

// Debounce hook for search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showVotingSection, setShowVotingSection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 20; // Show only 20 products per page
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce search by 300ms

  // Generate categories dynamically from the actual products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(product => product.category)));
    return ['All', ...uniqueCategories.sort()];
  }, [products]);

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Get current user ID
        let userId = localStorage.getItem('costcutter_user_id');
        if (!userId) {
          userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('costcutter_user_id', userId);
        }
        
        // Load all products using pagination
        let allProducts: any[] = [];
        let from = 0;
        const pageSize = 1000;
        
        while (true) {
          const { data, error } = await supabase
            .from('products_with_votes')
            .select('*')
            .order('vote_count', { ascending: false })
            .range(from, from + pageSize - 1);

          if (error) {
            console.error('Error loading products:', error);
            return;
          }

          if (!data || data.length === 0) {
            break; // No more products
          }

          // Check which products the user has voted for
          const productIds = data.map(p => p.id);
          const { data: userVotes, error: votesError } = await supabase
            .from('product_votes')
            .select('product_id')
            .eq('user_id', userId)
            .in('product_id', productIds);

          if (votesError) {
            console.error('Error loading user votes:', votesError);
          }

          const votedProductIds = new Set(userVotes?.map(v => v.product_id) || []);

          // Process products to add user_has_voted status
          const processedProducts = data.map(product => ({
            ...product,
            user_has_voted: votedProductIds.has(product.id)
          }));

          allProducts = [...allProducts, ...processedProducts];
          from += pageSize;
          
          // Safety check to prevent infinite loop
          if (allProducts.length >= 20000) {
            break;
          }
        }

        console.log(`✅ Loaded ${allProducts.length} products from Supabase`);
        setProducts(allProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Set up real-time subscription for vote updates
  useEffect(() => {
    const subscription = supabase
      .channel('product_votes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'product_votes' 
        }, 
        (payload) => {
          console.log('🔄 Real-time vote update:', payload);
          
          // Get current user ID
          const userId = localStorage.getItem('costcutter_user_id');
          
          // Update the product's vote count
          setProducts(prevProducts =>
            prevProducts.map(product => {
              if (product.id === payload.new.product_id) {
                return {
                  ...product,
                  vote_count: (product.vote_count || 0) + 1,
                  // If this vote is from the current user, mark as voted
                  user_has_voted: payload.new.user_id === userId ? true : product.user_has_voted
                };
              }
              return product;
            })
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Memoized popular products (products with votes)
  const popularProducts = useMemo(() => {
    return products
      .filter(product => (product.vote_count || 0) > 0)
      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
      .slice(0, 12); // Show top 12 most voted products
  }, [products]);

  // Memoized filtered products - show products with votes on home page, or filtered results
  const filteredProducts = useMemo(() => {
    // If no search term and "All" category is selected, show popular products
    if (!debouncedSearchTerm && selectedCategory === 'All') {
      return popularProducts;
    }
    
    const filtered = products.filter(product => {
      // If there's a search term, check if product matches search
      const matchesSearch = !debouncedSearchTerm || 
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // Check if product matches selected category
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    // Sort by vote count (highest first) to ensure most voted products appear at the top
    return filtered.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  }, [products, debouncedSearchTerm, selectedCategory, popularProducts]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Reset to first page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory]);

  const handleVote = useCallback(async (productId: string) => {
    try {
      // Get or create a persistent user ID
      let userId = localStorage.getItem('costcutter_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('costcutter_user_id', userId);
      }

      // Check if user has already voted for this product
      const product = products.find(p => p.id === productId);
      if (product?.user_has_voted) {
        alert('You have already voted for this product!');
        return;
      }
      
      // Update local state optimistically first
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { 
                ...product, 
                vote_count: (product.vote_count || 0) + 1,
                user_has_voted: true 
              }
            : product
        )
      );
      
      // Insert vote into database
      const { error } = await supabase
        .from('product_votes')
        .insert({ product_id: productId, user_id: userId });

      if (error) {
        console.error('Error voting:', error);
        
        // Check if it's a duplicate vote error
        if (error.code === '23505') { // Unique constraint violation
          alert('You have already voted for this product!');
        } else {
          alert('Failed to vote. Please try again.');
        }
        
        // Revert optimistic update on error
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId
              ? { 
                  ...product, 
                  vote_count: Math.max(0, (product.vote_count || 0) - 1),
                  user_has_voted: false 
                }
              : product
          )
        );
        return;
      }

      console.log('✅ Vote recorded successfully');
      // You could add a toast notification here in the future
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  }, [products]);

  const handleRequestProduct = useCallback(async (productName: string, category: string) => {
    try {
      // Get current user ID
      let userId = localStorage.getItem('costcutter_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('costcutter_user_id', userId);
      }

      const newProduct: Product = {
        id: Date.now().toString(),
        name: productName,
        category,
        description: `Customer requested: ${productName}`,
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
        cost_price: 0,
        retail_price: 0,
        pack_quantity: 1,
        unit_size: '',
        unit_description: '',
        barcode: '',
        supplier_code: '',
        vote_count: 1,
        user_has_voted: true,
      };

      // Insert the new product into the database
      const { error: productError } = await supabase
        .from('products')
        .insert({
          id: newProduct.id,
          name: newProduct.name,
          category: newProduct.category,
          description: newProduct.description,
          image_url: newProduct.image_url,
          cost_price: newProduct.cost_price,
          retail_price: newProduct.retail_price,
          pack_quantity: newProduct.pack_quantity,
          unit_size: newProduct.unit_size,
          unit_description: newProduct.unit_description,
          barcode: newProduct.barcode,
          supplier_code: newProduct.supplier_code,
        });

      if (productError) {
        console.error('Error creating product:', productError);
        alert('Failed to create product. Please try again.');
        return;
      }

      // Insert the vote for the new product
      const { error: voteError } = await supabase
        .from('product_votes')
        .insert({ product_id: newProduct.id, user_id: userId });

      if (voteError) {
        console.error('Error voting for new product:', voteError);
        alert('Product created but failed to vote. Please try voting again.');
      }

      setProducts(prevProducts => [newProduct, ...prevProducts]);
      setShowVotingSection(false);
    } catch (error) {
      console.error('Error requesting product:', error);
      alert('Failed to request product. Please try again.');
    }
  }, []);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <ShoppingCart style={{ marginRight: 16 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CostCutter Products
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Vote for products you'd like to see!
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              What products would you like to see at Costcutter Potato Wharf?
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Search existing products and vote for them, or request new ones!
            </Typography>
            
            {!loading && (
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
                {filteredProducts.length > 0 ? (
                  `Showing ${paginatedProducts.length} of ${filteredProducts.length} products (Page ${currentPage} of ${totalPages})`
                ) : (
                  !debouncedSearchTerm && selectedCategory === 'All' 
                    ? 'No products have been voted for yet. Be the first to vote for products you want to see!'
                    : 'No products found. Try adjusting your search or category filter.'
                )}
              </Typography>
            )}
          </Box>

          <ProductSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            onRequestNew={() => setShowVotingSection(true)}
          />

          {!debouncedSearchTerm && selectedCategory === 'All' && (
            <Typography variant="h6" component="h2" gutterBottom align="center" color="primary" sx={{ mb: 2, mt: 3 }}>
              🔥 Popular Products - What Others Want to See
            </Typography>
          )}

          {showVotingSection && (
            <VotingSection
              onRequestProduct={handleRequestProduct}
              onClose={() => setShowVotingSection(false)}
              categories={categories.filter(cat => cat !== 'All')}
            />
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <ProductList
                products={paginatedProducts}
                onVote={handleVote}
              />
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
