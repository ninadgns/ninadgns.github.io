import * as React from 'react';
import TheorySubject from './TheorySubject';
import LabSubject from './LabSubject';
import PrevCGPA from './PrevCGPA';
import { Box } from '@mui/material';
import { spacing } from '@mui/system';

import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
export default function App() {
  const [FOPGradePoint, setFOPGradePoint] = React.useState(4.00);
  const [DLDGradePoint, setDLDGradePoint] = React.useState(4.00);
  const [PhysicsGradePoint, setPhysicsGradePoint] = React.useState(4.00);
  const [MathGradePoint, setMathGradePoint] = React.useState(4.00);
  // const [FCCGradePoint, setFCCGradePoint] = React.useState(4.00);
  const [FOPLabGradePoint, setFOPLabGradePoint] = React.useState(4.00);
  const [DLDLabGradePoint, setDLDLabGradePoint] = React.useState(4.00);
  const [PhysicsLabGradePoint, setPhysicsLabGradePoint] = React.useState(4.00);
  const [EnglishLabGradePoint, setEnglishLabGradePoint] = React.useState(4.00);
  const [OldCGPA, setOldCGPA] = React.useState(4.00)
  let cgpa = 4;
  cgpa = (parseFloat(FOPGradePoint) + parseFloat(DLDGradePoint) + parseFloat(PhysicsGradePoint) + parseFloat(MathGradePoint) + parseFloat(FOPLabGradePoint)) * 3 + (parseFloat(EnglishLabGradePoint) + parseFloat(DLDLabGradePoint) + parseFloat(PhysicsLabGradePoint)) * 1.5
  let gpa = cgpa / 19.5
  gpa = gpa.toFixed(2)
  cgpa += OldCGPA * 18.5
  cgpa /= (19.5 + 18.5)

  cgpa = cgpa.toFixed(2)


  return (
    <Box sx={{ paddingX: 1 }}>
      <Grid zIndex={1} style={{ position: 'fixed', width: '100vw', left: '50%', transform: 'translate(-50%, 0%)', backgroundColor: 'white' }} >
        <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column' }}  >
          <p className='m-auto  h2'>CGPA Calculator</p>
          <p className='m-auto  h6'>CSEDU28 1-2</p>
        </Box>
        <Box marginTop={2} display={'flex'} flexDirection={'row'} justifyContent={"space-evenly"}>

          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>1-2 GPA: {gpa}</Typography>
          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>CGPA: {cgpa}</Typography>
        </Box>
      </Grid>
      <Grid marginBottom={1} style={{ paddingTop: '150px' }} alignItems={"center"} display={'flex'} flexDirection={"column"}>
        <PrevCGPA setCGPA={setOldCGPA}></PrevCGPA>
      </Grid>
      <Grid container justifyContent={'space-around'} marginBottom={5}  >
        <Grid width={{ xs: "100%", md: "69%" }}>
          <TheorySubject SubjectName={"FOP"} returnGradePoint={setFOPGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"DLD"} returnGradePoint={setDLDGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"Physics"} returnGradePoint={setPhysicsGradePoint}></TheorySubject>
          <TheorySubject SubjectName={"Math"} returnGradePoint={setMathGradePoint}></TheorySubject>
        </Grid>
        <Grid width={{ xs: "100%", md: "28%" }} marginBottom={5}  >
          <LabSubject SubjectName={"FOP Lab"} returnGradePoint={setFOPLabGradePoint}></LabSubject>
          <LabSubject SubjectName={"DLD Lab"} returnGradePoint={setDLDLabGradePoint}></LabSubject>
          <LabSubject SubjectName={"Physics Lab"} returnGradePoint={setPhysicsLabGradePoint}></LabSubject>
          <LabSubject SubjectName={"English Lab"} returnGradePoint={setEnglishLabGradePoint}></LabSubject>
        </Grid>
      </Grid>
    </Box>)
}
