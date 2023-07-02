import * as React from 'react';
import TheorySubject from './TheorySubject';
import LabSubject from './LabSubject';
import { Box } from '@mui/material';
import { spacing } from '@mui/system';

import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
export default function App() {
  const [EEEGradePoint, setEEEGradePoint] = React.useState(4.00);
  const [ChemistryGradePoint, setChemistryGradePoint] = React.useState(4.00);
  const [CalculusGradePoint, setCalculusGradePoint] = React.useState(4.00);
  const [DMGradePoint, setDMGradePoint] = React.useState(4.00);
  const [FCCGradePoint, setFCCGradePoint] = React.useState(4.00);
  const [EEELabGradePoint, setEEELabGradePoint] = React.useState(4.00);
  const [FCCLabGradePoint, setFCCLabGradePoint] = React.useState(4.00);
  const [ChemistryLabGradePoint, setChemistryLabGradePoint] = React.useState(4.00);
  let cgpa = 4;
  cgpa = (parseFloat(EEEGradePoint) + parseFloat(ChemistryGradePoint) + parseFloat(CalculusGradePoint) + parseFloat(DMGradePoint)) * 3 + (parseFloat(FCCGradePoint) * 2) + (parseFloat(EEELabGradePoint) + parseFloat(FCCLabGradePoint) + parseFloat(ChemistryLabGradePoint)) * 1.5
  cgpa /= 18.5
  cgpa = cgpa.toFixed(2)

  return (<Box sx={{ paddingX: 1 }}>

    {/* <h1>Your CGPA : {cgpa}</h1> */}
    <Box sx={{ mx: 'auto', width: 'fit-content', alignItems: 'center' ,display:'flex', flexDirection:'column' }} >
      <p className='m-auto  h2'>CGPA Calculator</p>
      <p className='m-auto  h6'>CSEDU28 1-1</p>
    </Box>
    <Box border={'solid'} sx={{ mx: 'auto', width: 'fit-content' }} marginBottom={1} marginTop={1} padding={1} borderColor={'red'}>
      <Typography variant='h3' fontFamily={'monospace'}>Your CGPA: {cgpa}</Typography>
    </Box>
    <Grid container justifyContent={'space-around'} >
      <Grid width={{ xs: "100%", md: "69%" }}>
        <TheorySubject SubjectName={"EEE"} returnGradePoint={setEEEGradePoint}></TheorySubject>
        <TheorySubject SubjectName={"Chemistry"} returnGradePoint={setChemistryGradePoint}></TheorySubject>
        <TheorySubject SubjectName={"Calculus"} returnGradePoint={setCalculusGradePoint}></TheorySubject>
        <TheorySubject SubjectName={"DM"} returnGradePoint={setDMGradePoint}></TheorySubject>
        <TheorySubject SubjectName={"FCC"} returnGradePoint={setFCCGradePoint}></TheorySubject>
      </Grid>
      <Grid width={{ xs: "100%", md: "28%" }}>
        <LabSubject SubjectName={"EEE Lab"} returnGradePoint={setEEELabGradePoint}></LabSubject>
        <LabSubject SubjectName={"FCC Lab"} returnGradePoint={setFCCLabGradePoint}></LabSubject>
        <LabSubject SubjectName={"Chemistry Lab"} returnGradePoint={setChemistryLabGradePoint}></LabSubject>
      </Grid>
    </Grid>
  </Box>)
}
