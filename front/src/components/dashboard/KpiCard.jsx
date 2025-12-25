import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const KpiCard = ({ title, value, icon, color = '#22c55e' }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        border: '2px solid',
        borderColor: color + '20',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${color}20`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          {icon && (
            <Typography variant="h5" sx={{ color }}>
              {icon}
            </Typography>
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#6b7280',
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h2"
          component="div"
          sx={{ 
            color,
            fontWeight: 700,
            textAlign: 'center',
            fontSize: { xs: '2.5rem', sm: '3rem' },
            textShadow: `0 2px 4px ${color}20`,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default KpiCard;