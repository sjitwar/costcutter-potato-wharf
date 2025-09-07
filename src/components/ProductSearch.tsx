import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
} from '@mui/material';
import { Search, Plus, X } from 'lucide-react';

interface ProductSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  onRequestNew: () => void;
}

const ProductSearch: React.FC<ProductSearchProps> = React.memo(({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  onRequestNew,
}) => {
  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search size={20} style={{ marginRight: 8, color: '#666' }} />,
            }}
            placeholder="Search by name or description..."
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Plus />}
            onClick={onRequestNew}
            sx={{ height: 56 }}
          >
            Request New
          </Button>
        </Grid>
        
        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<X />}
            onClick={handleClear}
            sx={{ height: 56 }}
            disabled={!searchTerm && selectedCategory === 'All'}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
});

ProductSearch.displayName = 'ProductSearch';

export default ProductSearch;
