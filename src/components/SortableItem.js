import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import DeleteIcon from '@mui/icons-material/Delete';

const SortableItem = ({ id, file, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <IconButton {...listeners} {...attributes} sx={{ cursor: 'grab', mr: 1 }}>
        <DragHandleIcon />
      </IconButton>
      <img src={file.preview} alt={file.name} style={{ width: 50, height: 50, marginRight: 8, objectFit: 'cover', borderRadius: '4px' }} />
      <Typography variant="body2" sx={{ flexGrow: 1, color: 'black' }}>{file.name}</Typography>
      <IconButton onClick={() => onDelete(id)}>
        <DeleteIcon sx={{ color: 'black' }} />
      </IconButton>
    </Box>
  );
};

export default SortableItem;