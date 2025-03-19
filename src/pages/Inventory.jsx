import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  InputAdornment,
  Fab,
  Zoom,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Inventory as InventoryIcon,
  SortByAlpha as SortByAlphaIcon,
  AttachMoney as PriceIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import Layout from '../components/common/Layout';
import DatabaseContext from '../contexts/DatabaseContext';
import UIContext from '../contexts/UIContext';
import { formatCurrency } from '../utils/formatUtils';

/**
 * Inventory page component
 * Displays and manages product inventory
 */
const Inventory = () => {
  const { getAllProducts, searchProducts } = useContext(DatabaseContext);
  const { showSnackbar, setLoading } = useContext(UIContext);
  const navigate = useNavigate();
  
  // State
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [sortBy]);

  // Load all products or search results
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      let productList;
      
      if (searchTerm) {
        productList = await searchProducts(searchTerm);
      } else {
        productList = await getAllProducts(sortBy);
      }
      
      setProducts(productList);
      setTotalProducts(productList.length);
    } catch (error) {
      console.error('Error loading products:', error);
      showSnackbar('Error loading products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    loadProducts();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    loadProducts();
  };

  // Navigate to product detail
  const goToProduct = (id) => {
    navigate(`/product/${id}`);
  };

  // Create new product
  const createProduct = () => {
    navigate('/product/create');
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // Product item component
  const ProductItem = ({ product }) => {
    // Choose color based on stock level
    const getStockColor = (quantity) => {
      if (quantity <= 0) return 'error.main';
      if (quantity < 5) return 'warning.main';
      return 'success.main';
    };

    return (
      <motion.div variants={itemVariants}>
        <ListItem
          button
          divider
          onClick={() => goToProduct(product.id)}
          sx={{
            py: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <Avatar
            sx={{ 
              bgcolor: 'primary.light',
              mr: 2
            }}
          >
            <InventoryIcon />
          </Avatar>
          
          <ListItemText
            primary={
              <Typography variant="subtitle1" fontWeight="medium" noWrap>
                {product.name}
              </Typography>
            }
            secondary={
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary" component="span">
                  Barcode: {product.barcode}
                </Typography>
                
                <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    size="small"
                    icon={<PriceIcon fontSize="small" />}
                    label={formatCurrency(product.price)}
                    sx={{ bgcolor: product.price > 0 ? 'primary.light' : 'error.light' }}
                  />
                  
                  <Chip
                    size="small"
                    icon={<TagIcon fontSize="small" />}
                    label={`${product.quantity} ${product.unit || 'pcs'}`}
                    sx={{ bgcolor: getStockColor(product.quantity) + '20', color: getStockColor(product.quantity) }}
                  />
                </Box>
              </Box>
            }
          />
        </ListItem>
      </motion.div>
    );
  };

  return (
    <Layout title="Inventory">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Search and sort */}
        <Paper
          elevation={2}
          component={motion.div}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          sx={{ p: 2, mb: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={clearSearch} size="small">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SortByAlphaIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="quantity">Quantity</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Product list */}
        <Paper
          elevation={2}
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" component="h2">
              Product List
            </Typography>
            
            <Chip 
              label={`${totalProducts} Products`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          
          {isLoading ? (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4
              }}
            >
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4
              }}
            >
              <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {searchTerm ? 'No products match your search' : 'No products in inventory'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try a different search term' : 'Add products to get started'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
              <AnimatePresence>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {products.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </List>
          )}
        </Paper>
        
        {/* Add product FAB */}
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="add product"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20
            }}
            onClick={createProduct}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      </Box>
    </Layout>
  );
};

export default Inventory;