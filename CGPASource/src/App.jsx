import React, { useState, useEffect, useRef } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import Oneone from './Oneone';
import Onetwo from './Onetwo';
import Twoone from './Twoone';
import Twotwo from './Twotwo';
import ThreeOne from './ThreeOne';
import ThreeTwo from './ThreeTwo';


export default function App() {
    const [selectedOption, setSelectedOption] = useState('');
    const [showSelector, setShowSelector] = useState(true);
    const scrollPositionRef = useRef(0);

    const handleChange = (event) => {
        // Save current scroll position before any changes
        scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        setSelectedOption(event.target.value);
        setShowSelector(false);
    };

    const handleClose = () => {
        // Immediately restore scroll position when Select closes
        // Use multiple methods to ensure it works
        const savedPosition = scrollPositionRef.current;
        window.scrollTo(0, savedPosition);
        document.documentElement.scrollTop = savedPosition;
        document.body.scrollTop = savedPosition;
    };

    // Restore scroll position after component renders
    useEffect(() => {
        if (selectedOption) {
            // Use multiple attempts to ensure scroll position is maintained
            const restoreScroll = () => {
                window.scrollTo({
                    top: scrollPositionRef.current,
                    behavior: 'auto' // Instant scroll, not smooth
                });
            };
            
            // Try immediately
            restoreScroll();
            
            // Try after multiple frames to catch any late scroll events
            setTimeout(restoreScroll, 0);
            setTimeout(restoreScroll, 10);
            setTimeout(restoreScroll, 50);
            requestAnimationFrame(restoreScroll);
            requestAnimationFrame(() => {
                requestAnimationFrame(restoreScroll);
            });
        }
    }, [selectedOption]);
    const renderComponent = () => {
        switch (selectedOption) {
            case 'option1':
                return <Oneone />;
            case 'option2':
                return <Onetwo />;
            case 'option3':
                return <Twoone />;
            case 'option4':
                return <Twotwo />;
            case 'option5':
                return <ThreeOne />;
            case 'option6':
                return <ThreeTwo />;
            default:
                return null;
        }

    };

    return (
        <div>
            {renderComponent()}
            <div style={{  padding: 10 }}>
                {showSelector && 
                <Typography variant="h2" align="center">CSEDU CGPA Calculator</Typography>
                // <h1 style={{ marginBottom: 50, textAlign: "center" , }}>CSEDU <br></br> CGPA Calculator</h1>
                }
                <div style={{ display: 'flex', alignItems: "center", margin: "auto", width: "fit-content", }}>
                    {/* {showSelector && <Typography variant="h5">Select semester: </Typography>} */}
                    {!showSelector && <h4>Change semester: </h4>}
                    <FormControl sx={{ m: 1, minWidth: 200 }}>
                        <InputLabel id="demo-simple-select-label">Select Semester</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedOption}
                            label="Semester"
                            autoWidth
                            onChange={handleChange}
                            onClose={handleClose}
                            MenuProps={{
                                disableScrollLock: true,
                                onClose: handleClose
                            }}
                        >

                            <MenuItem value="option1">1st Year 1st Semester</MenuItem>
                            <MenuItem value="option2">1st Year 2nd Semester</MenuItem>
                            <MenuItem value="option3">2nd Year 1st Semester</MenuItem>
                            <MenuItem value="option4">2nd Year 2nd Semester</MenuItem>
                            <MenuItem value="option5">3rd Year 1st Semester</MenuItem>
                            <MenuItem value="option6">3rd Year 2nd Semester</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>
        </div>
    )
}