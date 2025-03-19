import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
  MenuItem,
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  Save as SaveIcon,
  QrCodeScanner as ScannerIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';

import Layout from '../components/common/Layout';
import DatabaseContext from '../contexts/DatabaseContext';
import UIContext from '../contexts/UIContext';
import barcodeService from '../services/barcodeService';

/**
 * ProductCreate page component
 * Form for creating new products
 */
const ProductCreate = () => {
  const { addProduct, findProductByBarcode } = useContext(DatabaseContext);
  const { showSnackbar, setLoading } = useContext(UIContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get barcode from URL query params
  const queryParams = new URLSearchParams(location.search);
  const barcodeFromUrl = queryParams.get('barcode');
  
  // Form state
  const [barcode, setBarcode] = useState(barcodeFromUrl || '');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('шт');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef(null);
  
  // Units for dropdown
  const units = ['шт', 'кг', 'л', 'м', 'уп', 'компл', 'набор'];

  // Handle barcode scan
  useEffect(() => {
    if (isCameraOpen && webcamRef.current) {
      const handleBarcodeScan = async (detectedBarcode) => {
        setBarcode(detectedBarcode);
        setIsCameraOpen(false);
        
        // Check if product already exists
        const existingProduct = await findProductByBarcode(detectedBarcode);
        if (existingProduct) {
          showSnackbar(`Product with barcode ${detectedBarcode} already exists`, 'warning');
        }
        
        barcodeService.stopScanning();
      };
      
      // Start scanning with a delay to ensure camera is initialized
      const timer = setTimeout(() => {
        barcodeService.startScanning(webcamRef.current.video, handleBarcodeScan);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        barcodeService.stopScanning();
      };
    }
  }, [isCameraOpen, findProductByBarcode, showSnackbar]);

  // Toggle camera for barcode scanning
  const toggleCamera = () => {
    setIsCameraOpen(!isCameraOpen);
    if (isCameraOpen) {
      barcodeService.stopScanning();
    }
  };

  // Save product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!barcode || !name) {
      showSnackbar('Barcode and product name are required', 'error');
      return;
    }
    
    try {
      setIsSaving(true);
      setLoading(true);
      
      // Check if product already exists
      const existingProduct = await findProductByBarcode(barcode);
      
      if (existingProduct) {
        showSnackbar(`Product with barcode ${barcode} already exists`, 'error');
        return;
      }
      
      // Create product object
      const productData = {
        barcode,
        name,
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        quantity: parseInt(quantity) || 0,
        unit: unit || 'шт'
      };
      
      // Add product to database
      const productId = await addProduct(productData);
      
      showSnackbar('Product created successfully', 'success');
      
      // Navigate to inventory
      navigate('/inventory');
    } catch (error) {
      console.error('Error creating product:', error);
      showSnackbar('Failed to create product', 'error');
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Product" showBackButton>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
            New Product
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Barcode */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="barcode"
                  label="Barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleCamera} edge="end">
                          <ScannerIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              {/* Camera for scanning */}
              <Grid item xs={12}>
                <Collapse in={isCameraOpen}>
                  <Paper
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 200,
                      overflow: 'hidden',
                      borderRadius: 1,
                      mb: 2
                    }}
                  >
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      width="100%"
                      height="100%"
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: 'environment'
                      }}
                      style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.7)'
                        }
                      }}
                      onClick={toggleCamera}
                    >
                      <CloseIcon />
                    </IconButton>
                    
                    {/* Scanner overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        height: '60px',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.3)',
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                      }}
                    />
                  </Paper>
                </Collapse>
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
                  disabled={isSaving || !barcode || !name}
                  sx={{ mt: 2, py: 1.5 }}
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>
    </Layout>
  );
};

export default ProductCreate;