import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { Box } from '@mui/material';
import 'react-quill/dist/quill.snow.css';
// Importe ta fonction de sélection de fichier si nécessaire

const RichTextEditor = ({ value, onChange }) => {
  const quillRef = useRef(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Adaptation pour Next.js

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      if (quill && quill.getModule('toolbar')) {
        quill.getModule('toolbar').addHandler('image', handleImageUpload);
      }
    }
  }, []);

  const handleImageUpload = () => {
    console.log('Image upload triggered');
    
    if (typeof window !== 'undefined' && window.navigator.userAgent.includes('Chrome')) {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files ? input.files[0] : null;
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'temp/blog'); // Envoie dans le dossier temporaire pour les articles de blog


          try {
            const response = await fetch(`${apiUrl}/api/upload`, {
              method: 'POST',
              body: formData,
            });
            const result = await response.json();
            const quill = quillRef.current?.getEditor();
            const range = quill?.getSelection();

            if (quill && range) {
              quill.insertEmbed(range.index, 'image', result.url);
            }
          } catch (error) {
            console.error('Erreur lors de l’upload de l’image:', error);
          }
        } else {
          console.log('Aucun fichier sélectionné');
        }
      };
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      [{ font: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'link',
    'image',
    'video',
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mb: 3 }}>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        theme="snow"
        placeholder="Écrivez ici..."
        style={{ fontSize: '16px', lineHeight: '1.6', minHeight: '200px' }}
      />
    </Box>
  );
};

export default RichTextEditor;