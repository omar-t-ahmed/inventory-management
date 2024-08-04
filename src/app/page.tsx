'use client';
import { Box, Button, IconButton, Modal, Stack, TextField, Typography, AppBar, Toolbar, Slide, useScrollTrigger, InputBase, createTheme, ThemeProvider } from "@mui/material";
import { Add, Remove, Delete, Search } from '@mui/icons-material';
import { firestore } from "../../firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

interface InventoryItem {
  name: string;
  quantity?: number; // Add other properties if needed
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#865D36',
    },
    secondary: {
      main: '#3E362E',
    },
    background: {
      default: '#FFEBCD',
      paper: '#93785B',
    },
    text: {
      primary: '#3E362E',
      secondary: '#A69080',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h3: {
      fontWeight: 600,
      color: '#3E362E',
    },
    h6: {
      fontWeight: 500,
      color: '#3E362E',
    },
    body1: {
      color: '#3E362E',
    },
  },
});

function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList: InventoryItem[] = [];

    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
  };

  const removeItem = async (item: string) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data() as InventoryItem;
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: (quantity || 0) - 1 }, { merge: true });
      }
    }

    await updateInventory();
  };

  const deleteItem = async (item: string) => {
    const docRef = doc(firestore, 'inventory', item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  const addItem = async (item: string) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data() as InventoryItem;
      await setDoc(docRef, { quantity: (quantity || 0) + 1 }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <HideOnScroll>
        <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex' }}>
          <Box component="span" color="white">
            Stock
          </Box>
          <Box component="span" color="black">
            Mate
          </Box>
        </Typography>
        <IconButton color="inherit" onClick={() => setSearchOpen(!searchOpen)}>
          <Search />
        </IconButton>
        {searchOpen && (
          <Box component="form" sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <InputBase
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ color: 'black', background: '#fff', borderRadius: 1, paddingLeft: 1, paddingRight: 1, transition: 'width 0.4s', width: searchOpen ? '200px' : '0px' }}
            />
          </Box>
        )}
      </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Box width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" flexDirection="column" bgcolor="background.default" p={2}>
        <Box 
          width="500px" 
          p={2} 
          mb={2} 
          bgcolor="rgba(255, 255, 255, 0.5)" 
          borderRadius="8px" 
          boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          sx={{ backdropFilter: 'blur(10px)' }}
        >
          <Typography variant="h6" color="textPrimary" textAlign="center">
            Inventory
          </Typography>
        </Box>
        <Modal open={open} onClose={handleClose}>
          <Box position={'absolute'} top={'50%'} left={'50%'} width={400} bgcolor={'white'} borderRadius={2} boxShadow={24} p={4} display={'flex'} flexDirection={'column'} gap={3} sx={{ transform: 'translate(-50%,-50%)' }}>
            <Typography variant="h6" color="textPrimary" textAlign="center">
              Add Item
            </Typography>
            <Stack width='100%' direction={'row'} spacing={2}>
              <TextField
                variant='outlined'
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item Name"
              />
              <Button variant='contained' color="primary" onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}>Add</Button>
            </Stack>
          </Box>
        </Modal>
        <Stack width="500px" height="400px" spacing={2} overflow="auto" marginBottom={'20px'}>
          {filteredInventory.map((item, i) => (
            <Box
              key={i}
              width="100%"
              height="50px"
              display="flex"
              justifyContent='space-between'
              alignItems="center"
              bgcolor="background.paper"
              borderRadius="4px"
              boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
              p={1}
              sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' } }}
            >
              <Typography variant="body1" color="textPrimary">{item.name.charAt(0).toUpperCase() + item.name.slice(1)} : {item.quantity}</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => removeItem(item.name)} size="small" color="primary">
                  <Remove />
                </IconButton>
                <IconButton onClick={() => addItem(item.name)} size="small" color="primary">
                  <Add />
                </IconButton>
                <IconButton onClick={() => deleteItem(item.name)} size="small" color="secondary">
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
        <Button
          variant='contained'
          color="primary"
          onClick={handleOpen}>
          Add New Item
        </Button>
      </Box>
    </ThemeProvider>
  );
}