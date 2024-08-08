'use client'
import { Box, Stack, Typography, Button, Modal } from '@mui/material';
import { firestore } from '@/firebase'; // Ensure correct path
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import WebcamCapture from './components/WebcamCapture'; // Import WebcamCapture component
import { getRecipeSuggestions } from './api/recipe/route'; // Import the API function

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [recipes, setRecipes] = useState([]); // State to hold recipes
  const [recipeOpen, setRecipeOpen] = useState(false); // State to control recipe modal visibility

  const handleRecipeOpen = () => setRecipeOpen(true);
  const handleRecipeClose = () => setRecipeOpen(false);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const doc = await getDocs(snapshot);
    const pantryList = [];
    doc.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
      await updatePantry();
      return;
    } else {
      await setDoc(docRef, { count: 1 });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
      await updatePantry();
    }
  };

  const handleDetect = async (predictions) => {
    for (let prediction of predictions) {
      const itemName = prediction.class;
      await addItem(itemName);
    }
    setIsCameraOpen(false); // Close the camera after processing
  };

  const suggestRecipes = async () => {
    const pantryItems = pantry.map(item => item.name);
    const response = await fetch('/api/recipe/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: pantryItems }),
    });
    const data = await response.json();
    setRecipes(data.recipes);
    handleRecipeOpen();
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Button variant="contained" onClick={() => setIsCameraOpen(true)}>
        Use Camera
      </Button>

      {/* Display the pantry items */}
      <Box border={'1px solid #333'}>
        <Box width="800px" height="100px" bgcolor={'#ADD8E6'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Pantry Items
          </Typography>
        </Box>

        <Stack width='800px' height='300px' spacing={2} overflow={'auto'}>
          {pantry.map(({ name, count }) => (
            <Box
              key={name}
              width='100%'
              minHeight='150px'
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
              style={{ cursor: 'pointer' }}
            >
              <Typography
                variant={'h3'}
                color={'#333'}
                textAlign={'center'}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                Quantity: {count}
              </Typography>

              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>

      <Button variant="contained" onClick={suggestRecipes}>
        Get Recipe Suggestions
      </Button>

      {/* Render the WebcamCapture component when the camera is open */}
      {isCameraOpen && <WebcamCapture onDetect={handleDetect} />}

      {/* Modal to display recipes */}
      <Modal
        open={recipeOpen}
        onClose={handleRecipeClose}
        aria-labelledby="recipe-modal-title"
        aria-describedby="recipe-modal-description"
      >
        <Box sx={style}>
          <Typography id="recipe-modal-title" variant="h6" component="h2">
            Recipe Suggestions
          </Typography>
          <Stack spacing={2}>
            {recipes.map((recipe, index) => (
              <Box key={index}>
                <Typography variant="h6">{recipe}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
