// src/components/dashboard/ActionCard.jsx
import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const ActionCard = ({ icon, title, color, onClick }) => {
  const theme = useTheme();

  // Определите цвет, учитывая, является ли проп color функцией или нет
  const cardColor = typeof color === 'function' ? color(theme) : color;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          bgcolor: cardColor, // Используйте вычисленный cardColor
          color: 'white',
          cursor: 'pointer',
          boxShadow: 2,
          transition: 'all 0.3s ease'
        }}
        onClick={onClick}
      >
        <CardContent sx={{
          display: 'flex',
          alignItems: 'center',
          p: 3,
          '&:last-child': { pb: 3 }
        }}>
          <Box sx={{ mr: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" fontWeight="500">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActionCard;