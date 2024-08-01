'use client'
import { Box, Modal, Stack, Typography } from "@mui/material";
import { firestore } from "../../firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

interface InventoryItem {
  name: string;
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState<Boolean>(true)
  const [itemName, setItemName] = useState()

  const handleOpen = () => {setOpen(true)}
  const handleClose = () => {setOpen(false)}

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList: InventoryItem[] = []

    docs.forEach((doc) => {
      inventoryList.push({
        name:doc.id, 
        ...doc.data()
      })
    })
    setInventory(inventoryList)
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory', item))
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quantity} = docSnap.data()

      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantiy: quantity - 1})
      }
    }

    await updateInventory()
  }


  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory', item))
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    } else {
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory() 
  }

  useEffect(() => {
    updateInventory()
  }, [])

  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" flexDirection="column">
      <Modal open={open} onClose={handleClose}>
          <Box position={'absolute'} top={'50%'} left={'50%'} width={400} bgcolor={'white'} border={'2px solid #0000'} boxShadow={34} p={4} dosplay={'flex'} flexDirection={'column'} gap ={3} sx={{transform:'translate(-50%,-50%)'}}>
            <Typography variant="h6" color="#333" textAlign="center">
              Add Item
            </Typography>

            <Stack width='100%' direction={'row'} spacing={2}>
            </Stack>
          </Box>
      </Modal>

      <Typography variant="h3" color="#333" textAlign="center">
        Inventory Management
      </Typography>
    </Box>
  );
}

      {/* <Box padding="10px" borderRadius="4px" boxShadow="0 1px 3px rgba(0, 0, 0, 0.5)">
        <Box width="500px" bgcolor="#9fd4a3" borderRadius="4px" padding={'20px'} boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)" display="flex" justifyContent="center" alignItems="center">
          <Typography variant="h4" color="#333" textAlign="center">
            Inventory Management
          </Typography>
        </Box>
        <Stack width="500px" height="400px" spacing={2} overflow="auto">
          {inventory.map((item, i) => (
            <Box
              key={i}
              width="100%"
              height="50px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              bgcolor="#d3d3d3"
              borderRadius="4px"
              boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
              p={1}
            >
              {item.name}
              {item.quantity}
            </Box>
          ))}
        </Stack>
      </Box> */}