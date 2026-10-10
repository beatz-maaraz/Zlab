import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';

/**
 * 3. M3 Containment Component Suite
 * Includes: Elevated Card, Outlined Card, and Dialog preview card
 */
export const M3ElevatedCard = ({
  title = 'Neon Prototype Canvas',
  subheader = 'Z Lab Design Suite v2.4',
  description = 'Material Design 3 tokens mapped with glowing cyberpunk neon surfaces and dynamic layouts.',
  onPrimaryClick,
}) => {
  return (
    <Card
      data-m3-widget="elevated-card"
      sx={{
        maxWidth: 380,
        borderRadius: '24px',
        backgroundColor: '#211f26',
        border: '1px solid #36343b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(208, 188, 255, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
        '&:hover': {
          borderColor: 'rgba(208, 188, 255, 0.4)',
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 24px rgba(208, 188, 255, 0.2)',
        },
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: '#4f378b',
              color: '#eaddff',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            M3
          </Avatar>
        }
        action={
          <IconButton aria-label="settings" sx={{ color: '#cac4d0' }}>
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography variant="subtitle1" sx={{ color: '#e6e0e9', fontWeight: 600 }}>
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ color: '#938f99' }}>
            {subheader}
          </Typography>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" sx={{ color: '#cac4d0', lineHeight: 1.6 }}>
          {description}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip
            label="Material 3"
            size="small"
            sx={{
              bgcolor: '#4a4458',
              color: '#e8def8',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          />
          <Chip
            label="Glowing Dark"
            size="small"
            variant="outlined"
            sx={{
              borderColor: '#938f99',
              color: '#d0bcff',
              fontSize: '0.75rem',
            }}
          />
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ color: '#cac4d0', '&:hover': { color: '#d0bcff' } }}>
            <FavoriteIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: '#cac4d0', '&:hover': { color: '#d0bcff' } }}>
            <ShareIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Button
          size="small"
          variant="contained"
          onClick={onPrimaryClick}
          sx={{
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#d0bcff',
            color: '#381e72',
            '&:hover': { bgcolor: '#eaddff' },
          }}
        >
          Explore
        </Button>
      </CardActions>
    </Card>
  );
};

export const M3OutlinedCard = ({
  title = 'Design Token Inspector',
  description = 'Inspect container roles, surface tints, state layers, and typography scale.',
}) => {
  return (
    <Card
      data-m3-widget="outlined-card"
      variant="outlined"
      sx={{
        maxWidth: 380,
        borderRadius: '20px',
        backgroundColor: '#1d1b20',
        borderColor: '#49454f',
        p: 2.5,
        '&:hover': {
          borderColor: '#938f99',
        },
      }}
    >
      <Typography variant="subtitle2" sx={{ color: '#e6e0e9', fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#cac4d0', mb: 2, fontSize: '0.85rem' }}>
        {description}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        sx={{
          borderRadius: '16px',
          borderColor: '#938f99',
          color: '#d0bcff',
          textTransform: 'none',
        }}
      >
        View Tokens
      </Button>
    </Card>
  );
};

export const M3DialogPreview = ({
  title = 'Deploy to Z Lab Cloud?',
  content = 'This action will generate production assets and sync all artboard components with the remote design system.',
  onConfirm,
  onCancel,
}) => {
  return (
    <Box
      data-m3-widget="dialog-preview"
      sx={{
        maxWidth: 360,
        p: 3,
        borderRadius: '28px',
        backgroundColor: '#2b2930',
        border: '1px solid #48464c',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 20px rgba(208, 188, 255, 0.15)',
      }}
    >
      <Typography variant="h6" sx={{ color: '#e6e0e9', fontWeight: 600, mb: 1.5, fontSize: '1.1rem' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#cac4d0', mb: 3, lineHeight: 1.5 }}>
        {content}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Button
          onClick={onCancel}
          sx={{
            color: '#d0bcff',
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            backgroundColor: '#d0bcff',
            color: '#381e72',
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#eaddff' },
          }}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export const M3ContainmentGroup = () => {
  return (
    <Stack spacing={3} data-m3-widget="containment-group">
      <M3ElevatedCard />
      <M3OutlinedCard />
      <M3DialogPreview />
    </Stack>
  );
};

export default M3ContainmentGroup;
