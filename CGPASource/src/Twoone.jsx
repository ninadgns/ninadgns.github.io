import * as React from 'react';
import TheorySubject from './TheorySubject'
import LabSubject from './LabSubject'
import PrevCGPA from './PrevCGPA';
import { Box } from '@mui/material';
import { spacing } from '@mui/system';

import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
export default function Twoone() {
  const [DSAGradePoint, setDSAGradePoint] = React.useState(4.00);
  const [EEEGradePoint, setEEEGradePoint] = React.useState(4.00);
  const [GEDGradePoint, setGEDGradePoint] = React.useState(4.00);
  const [MathGradePoint, setMathGradePoint] = React.useState(4.00);
  const [OOPGradePoint, setOOPGradePoint] = React.useState(4.00);
  // const [FCCGradePoint, setFCCGradePoint] = React.useState(4.00);
  const [DSALabGradePoint, setDSALabGradePoint] = React.useState(4.00);
  const [EEELabGradePoint, setEEELabGradePoint] = React.useState(4.00);
  const [OOPLabGradePoint, setOOPLabGradePoint] = React.useState(4.00);
  const [OldCGPA, setOldCGPA] = React.useState(4.00)
  let cgpa = 4;
  cgpa = (parseFloat(DSAGradePoint) + parseFloat(EEEGradePoint) + parseFloat(OOPGradePoint) + parseFloat(MathGradePoint)) * 3 + parseFloat(GEDGradePoint) * 2 + (parseFloat(DSALabGradePoint) + parseFloat(OOPLabGradePoint)) * 1.5 + parseFloat(EEELabGradePoint) * .75;
  let gpa = cgpa / 17.75
  gpa = gpa.toFixed(2)
  cgpa += OldCGPA * 38
  cgpa /= (17.75 + 38)

  cgpa = cgpa.toFixed(2)


  return (
    <Box sx={{ paddingX: 1 }}>
      <Grid zIndex={1} style={{ position: 'fixed', width: '100vw', left: '50%', transform: 'translate(-50%, 0%)', backgroundColor: 'white' }} >
        <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column' }}  >
          <p className='m-auto  h2'>CGPA Calculator</p>
          <p className='m-auto  h6'>CSEDU28 2-1</p>
        </Box>
        <Box marginTop={2} display={'flex'} flexDirection={'row'} justifyContent={"space-evenly"}>

          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>2-1 GPA: {gpa}</Typography>
          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>CGPA: {cgpa}</Typography>
        </Box>
      </Grid>
      <Grid marginBottom={1} style={{ paddingTop: '150px' }} alignItems={"center"} display={'flex'} flexDirection={"column"}>
        <PrevCGPA setCGPA={setOldCGPA}></PrevCGPA>
      </Grid>
      <Grid container justifyContent={'space-around'} marginBottom={5}  >
        <Grid width={{ xs: "100%", md: "69%" }}>
          <TheorySubject SubjectName={"DSA"} returnGradePoint={setDSAGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"OOP"} returnGradePoint={setOOPGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"Math"} returnGradePoint={setMathGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"EEE"} returnGradePoint={setEEEGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"GED"} returnGradePoint={setGEDGradePoint}></TheorySubject>
        </Grid>
        <Grid width={{ xs: "100%", md: "28%" }} marginBottom={5}  >
          <LabSubject SubjectName={"DSA Lab"} returnGradePoint={setDSALabGradePoint}></LabSubject>
          <LabSubject SubjectName={"EEE Lab"} returnGradePoint={setEEELabGradePoint}></LabSubject>
          <LabSubject SubjectName={"OOP Lab"} returnGradePoint={setOOPLabGradePoint}></LabSubject>
        </Grid>
      </Grid>
    </Box>)
}
