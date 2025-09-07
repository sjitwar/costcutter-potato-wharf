import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { TrendingUp } from 'lucide-react';
import { Product } from '../App';

interface ProductListProps {
  products: Product[];
  onVote: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = React.memo(({ products, onVote }) => {
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No products to display
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Start typing in the search box or select a category to see products.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                  {product.name}
                </Typography>
                {(product.vote_count || 0) > 0 && (
                  <Chip 
                    icon={<TrendingUp size={14} />}
                    label={`${product.vote_count || 0}`}
                    color="primary" 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              
              <Chip 
                label={product.category} 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ mb: 1, alignSelf: 'flex-start' }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {product.description}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp size={16} style={{ marginRight: 4 }} />
                  <Typography 
                    variant="body2" 
                    color={(product.vote_count || 0) > 0 ? "primary" : "text.secondary"} 
                    sx={{ 
                      fontWeight: (product.vote_count || 0) > 0 ? 'bold' : 'normal',
                      fontSize: (product.vote_count || 0) > 0 ? '0.9rem' : '0.8rem'
                    }}
                  >
                    {product.vote_count || 0} {(product.vote_count || 0) === 1 ? 'vote' : 'votes'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onVote(product.id)}
                  disabled={product.user_has_voted}
                  sx={{ minWidth: 'auto' }}
                >
                  {product.user_has_voted ? 'Voted' : 'Vote'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
});

ProductList.displayName = 'ProductList';

export default ProductList;
