import React, { useState, useEffect } from "react";
import { TextField, Button, DialogContent } from "@mui/material";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Copyright from "../../dashboard/pages/Copyright";
import {Select, InputLabel, MenuItem} from "@mui/material";


import {
  mainListItems,
  secondaryListItems,
} from "../../dashboard/pages/listItems";
import axios from "axios";
import { baseServiceUrl } from "../../../api/url";

const defaultTheme = createTheme();
const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const BatchForm = () => {
  const [open, setOpen] = React.useState(true);
  const [domain, setDomain] = useState([])
  const [loading, setLoading] = useState(true)
  const [msgResponse, setMsgResponse] = useState("")

  useEffect(()=>{
    
      const fetchData = async () => {
        setLoading(true)
        try{
          const resDomain = await axios.get(`${baseServiceUrl}/program`)
          setDomain(resDomain.data)
        } catch(error){
          console.log('ERR')
        }
        setLoading(false)
      }
      fetchData()

  },[])

  if(!loading){
    console.log('Program:', domain)
  }
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const [formData, setFormData] = useState({
    batchName: "",
    programId: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    console.log(formData);
    const res = await axios.post(`${baseServiceUrl}/batch`, formData)
    console.log(res.data.msg)
    setMsgResponse(res.data.msg)
  };

  if(loading){
    return(
      <div>Loading...</div>
    )
    
  }
  else{
    return (
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: "24px", // keep right padding when drawer closed
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "36px",
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
                Add Batch
              </Typography>
              <IconButton color="inherit">
                <Badge badgeContent={4} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              {mainListItems}
              <Divider sx={{ my: 1 }} />
              {secondaryListItems}
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
            }}
          ></Box>
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <div className="main">
              <br></br>
              <TextField
                label="Batch Name"
                name="batchName"
                value={formData.batchName}
                onChange={handleInputChange}
                fullWidth
                className="form-field"
                sx={{ mt: 2 }}
              />
              <InputLabel id="domain-label-id">Program Name</InputLabel>
              <Select
                labelId="domain-label-id"
                id="programId"
                name="programId"
                value={formData.programId}
                label="Domain Name"
                onChange={handleInputChange}
              >
                {
                    domain.map(d => {
                      console.log(d._id)
                      return <MenuItem value={d._id}>{d.programName}</MenuItem>
                    })                
                }             
              </Select>
  
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                className="form-button"
                sx={{ mt: 2, ml: 2 }}
              >
                Submit
              </Button>
            </div>
            <br></br><br></br>
            {msgResponse}
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  
};

export default BatchForm;
