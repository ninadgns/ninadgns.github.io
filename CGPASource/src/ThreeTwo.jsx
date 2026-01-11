import * as React from 'react';
import TheorySubject from './TheorySubject'
import LabSubject from './LabSubject'
import PrevCGPA from './PrevCGPA';
import { Box } from '@mui/material';
import { spacing } from '@mui/system';

import { Grid } from '@mui/material';
import { Typography } from '@mui/material';

export default function ThreeTwo() {
  // Theory Subjects
  const [OS, setOS] = React.useState(4.00);
  const [Numerical, setNumerical] = React.useState(4.00);
  const [Algo2, setAlgo2] = React.useState(4.00);
  const [FormalLang, setFormalLang] = React.useState(4.00);
  const [Stats, setStats] = React.useState(4.00);

  // Lab Subjects
  const [OSLab, setOSLab] = React.useState(4.00);
  const [NumericalLab, setNumericalLab] = React.useState(4.00);
  const [SDPLab, setSDPLab] = React.useState(4.00);
  const [TechWriteLab, setTechWriteLab] = React.useState(4.00);

  const [OldCGPA, setOldCGPA] = React.useState(4.00)
  
  // Credit Calculations
  // Theory: 5 subjects * 3.0 credits = 15.0
  // Lab: 1.5 + 0.75 + 1.5 + 0.75 = 4.5
  // Total Semester Credits: 19.5
  
  // Previous Credits (up to 3-1): 75 + 19.5 = 94.5
  const PREV_CREDITS = 94.5;
  const CURRENT_CREDITS = 19.5;

  let totalPoints = 
    3.0 * (
      parseFloat(OS) +
      parseFloat(Numerical) +
      parseFloat(Algo2) +
      parseFloat(FormalLang) +
      parseFloat(Stats)
    ) +
    1.5 * parseFloat(OSLab) +
    0.75 * parseFloat(NumericalLab) +
    1.5 * parseFloat(SDPLab) +
    0.75 * parseFloat(TechWriteLab);

  let gpa = totalPoints / CURRENT_CREDITS;
  gpa = gpa.toFixed(2);

  let cgpa = (totalPoints + (OldCGPA * PREV_CREDITS)) / (CURRENT_CREDITS + PREV_CREDITS);
  cgpa = cgpa.toFixed(2);


  return (
    <Box sx={{ paddingX: 1 }}>
      <Grid zIndex={1} style={{ position: 'fixed', width: '100vw', left: '50%', transform: 'translate(-50%, 0%)', backgroundColor: 'white' }} >
        <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column' }}  >
          <p className='m-auto  h2'>CGPA Calculator</p>
          <p className='m-auto  h6'>CSEDU28 3-2</p>
        </Box>
        <Box marginTop={2} display={'flex'} flexDirection={'row'} justifyContent={"space-evenly"}>

          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>3-2 GPA: {gpa}</Typography>
          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>CGPA: {cgpa}</Typography>
        </Box>
      </Grid>
      <Grid marginBottom={1} style={{ paddingTop: '150px' }} alignItems={"center"} display={'flex'} flexDirection={"column"}>
        <PrevCGPA setCGPA={setOldCGPA}></PrevCGPA>
      </Grid>
      <Grid container justifyContent={'space-around'} marginBottom={5}  >
        <Grid width={{ xs: "100%", md: "69%" }}>
          <TheorySubject SubjectName={"Operating Systems"} returnGradePoint={setOS}></TheorySubject>
          <TheorySubject SubjectName={"Numerical Methods"} returnGradePoint={setNumerical}></TheorySubject>
          <TheorySubject SubjectName={"Design and Analysis of Algorithms - II"} returnGradePoint={setAlgo2}></TheorySubject>
          <TheorySubject SubjectName={"Formal Language, Automata and Computability"} returnGradePoint={setFormalLang}></TheorySubject>
          <TheorySubject SubjectName={"Introduction to Probability and Statistics"} returnGradePoint={setStats}></TheorySubject>
        </Grid>
        <Grid width={{ xs: "100%", md: "28%" }} marginBottom={5}  >
          <LabSubject SubjectName={"Operating Systems Lab"} returnGradePoint={setOSLab}></LabSubject>
          <LabSubject SubjectName={"Software Design Patterns Lab"} returnGradePoint={setSDPLab}></LabSubject>
          <LabSubject SubjectName={"Numerical Methods Lab"} returnGradePoint={setNumericalLab}></LabSubject>
          <LabSubject SubjectName={"Technical Writing and Presentation Lab"} returnGradePoint={setTechWriteLab}></LabSubject>
        </Grid>
      </Grid>
    </Box >)
}
