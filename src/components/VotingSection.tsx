import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { X, Plus } from 'lucide-react';

interface VotingSectionProps {
  onRequestProduct: (productName: string, category: string) => void;
  onClose: () => void;
  categories: string[];
}

const VotingSection: React.FC<VotingSectionProps> = ({
  onRequestProduct,
  onClose,
  categories,
}) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!productName.trim()) {
      setError('Please enter a product name');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }

    onRequestProduct(productName.trim(), category);
    setProductName('');
    setCategory('');
    setError('');
  };

  const handleClose = () => {
    setProductName('');
    setCategory('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Request New Product</Typography>
          <Button onClick={handleClose} sx={{ minWidth: 'auto' }}>
            <X />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Help us stock the products you want! Enter the name of a product you'd like to see at CostCutter.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Product Name"
          value={productName}
          onChange={(e) => {
            setProductName(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g., Organic Greek Yogurt"
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => {
              setCategory(e.target.value);
              if (error) setError('');
            }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Plus />}
          disabled={!productName.trim() || !category}
        >
          Request Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VotingSection;
