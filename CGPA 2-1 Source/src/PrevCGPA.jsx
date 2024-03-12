import * as React from 'react'
import { Grid, TextField } from '@mui/material';

export default function PrevCGPA({ setCGPA }) {
    const [inputNumber, setInputNumber] = React.useState(4.00);
    const [displayedNumber, setDisplayedNumber] = React.useState(null);

    // const handleSubmit = (e) => {
    //     e.preventDefault();

    //     const parsedNumber = parseFloat(inputNumber);
    //     if (!isNaN(parsedNumber)) {
    //         setDisplayedNumber(parsedNumber);
    //         setCGPA(parsedNumber)
    //     } else {
    //         alert('Please enter a valid number');
    //     }
    // };

    return (
        <Grid style={{ width: 'fit-content' }} zIndex={0} >

            <TextField fullWidth="true"  required onChange={(e) => setCGPA(e.target.value)} id="oldCGPA" label="Enter Previous CGPA" defaultValue={inputNumber.toFixed(2)} style={{width:'307px'}} variant='outlined' />

            {/* <form onSubmit={handleSubmit}>
                <label>
                    Enter previous CGPA:
                    <input
                        type="text"
                        value={inputNumber}
                        onChange={(e) => setInputNumber(e.target.value)}
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
            {
                displayedNumber !== null && (
                    <Grid width={'fit-content'}>
                        <h4>Previous CGPA: {displayedNumber}</h4>
                        <p></p>
                    </Grid width={'fit-content'}>
                )
            } */}


            {/* <h2>Displayer  Number{displayedNumber}</h2> */}
        </Grid  >
    );
}
