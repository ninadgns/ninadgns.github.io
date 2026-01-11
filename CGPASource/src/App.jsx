import React, { useState, useRef } from 'react';
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
    const targetRef = useRef(null);

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
        setShowSelector(false);
        targetRef.current.scrollIntoView({ behavior: 'smooth' })
    };
    const renderComponent = () => {
        switch (selectedOption) {
            case 'option1':
                return <Oneone ref={targetRef} />;
            case 'option2':
                return <Onetwo ref={targetRef} />;
            case 'option3':
                return <Twoone ref={targetRef} />;
            case 'option4':
                return <Twotwo ref={targetRef} />;
            case 'option5':
                return <ThreeOne ref={targetRef} />;
            case 'option6':
                return <ThreeTwo ref={targetRef} />;
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