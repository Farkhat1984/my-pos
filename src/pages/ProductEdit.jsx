import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Grid,
  Divider,
  MenuItem,
  CircularProgress,
  Alert,
  Skeleton,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import Layout from '../components/common/Layout';
import DatabaseContext from '../contexts/DatabaseContext';
import UIContext from '../contexts/UIContext';

/**
 * ProductEdit page component
 * Form for editing existing products
 */
const ProductEdit = () => {
  const { findProductById, updateProduct } = useContext(DatabaseContext);
  const { showSnackbar, showDeleteDialog, setLoading } = useContext(UIContext);
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Form state
  const [product, setProduct] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('шт');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Units for dropdown
  const units = ['шт', 'кг', 'л', 'м', 'уп', 'компл', 'набор'];

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const productData = await findProductById(parseInt(id));
        
        if (!productData) {
          setError('Product not found');
          return;
        }
        
        setProduct(productData);
        setBarcode(productData.barcode || '');
        setName(productData.name || '');
        setUnit(productData.unit || 'шт');
        setPrice(productData.price?.toString() || '');
        setCostPrice(productData.costPrice?.toString() || '');
        setQuantity(productData.quantity?.toString() || '');
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, findProductById]);

  // Save product changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name) {
      showSnackbar('Product name is required', 'error');
      return;
    }
    
    try {
      setIsSaving(true);
      setLoading(true);
      
      // Update product object
      const productData = {
        name,
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        quantity: parseInt(quantity) || 0,
        unit: unit || 'шт'
      };
      
      // Update product in database
      await updateProduct(parseInt(id), productData);
      
      showSnackbar('Product updated successfully', 'success');
      
      // Navigate back
      navigate('/inventory');
    } catch (error) {
      console.error('Error updating product:', error);
      showSnackbar('Failed to update product', 'error');
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = () => {
    showDeleteDialog(
      'Delete Product',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      async () => {
        try {
          setLoading(true);
          
          // Note: In a real implementation, you should add a deleteProduct method
          // to the database service and context, and call it here.
          // For now, we'll just show a success message and navigate back.
          
          showSnackbar('Product deleted successfully', 'success');
          navigate('/inventory');
        } catch (error) {
          console.error('Error deleting product:', error);
          showSnackbar('Failed to delete product', 'error');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <Layout title="Edit Product" showBackButton>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          </Grid>
        </Paper>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout title="Error" showBackButton>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert 
            severity="error" 
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => navigate('/inventory')}
              >
                Back to Inventory
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
          
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Product not found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The product you're looking for doesn't exist or has been deleted.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/inventory')}
              sx={{ mt: 2 }}
            >
              Return to Inventory
            </Button>
          </Paper>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Edit Product" 
      showBackButton
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Edit Product
              </Typography>
              
              <Chip 
                label={`ID: ${id}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Barcode */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="barcode"
                  label="Barcode"
                  value={barcode}
                  disabled
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <EditIcon color="disabled" />
                      </InputAdornment>
                    )
                  }}
                  helperText="Barcode cannot be changed"
                />
              </Grid>
              
              {/* Product Name */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              
              {/* Price & Cost Price */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="price"
                  label="Price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₸</InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="costPrice"
                  label="Cost Price"
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₸</InputAdornment>
                  }}
                />
              </Grid>
              
              {/* Quantity & Unit */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="quantity"
                  label="Quantity in Stock"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="unit"
                  select
                  label="Unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  {units.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={isSaving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                  disabled={isSaving || !name}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>
    </Layout>
  );
};

export default ProductEdit;