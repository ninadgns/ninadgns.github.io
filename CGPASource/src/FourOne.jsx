import * as React from 'react';
import TheorySubject from './TheorySubject'
import LabSubject from './LabSubject'
import PrevCGPA from './PrevCGPA';
import { Box } from '@mui/material';

import { Grid } from '@mui/material';
import { Typography } from '@mui/material';

export default function FourOne() {
  const [AI, setAI] = React.useState(4.00);
  const [MathStats, setMathStats] = React.useState(4.00);
  const [ML, setML] = React.useState(4.00);
  const [DataScience, setDataScience] = React.useState(4.00);

  const [AILab, setAILab] = React.useState(4.00);
  const [MLLab, setMLLab] = React.useState(4.00);
  const [InternetProgLab, setInternetProgLab] = React.useState(4.00);
  const [ProjectThesis, setProjectThesis] = React.useState(4.00);

  const [OldCGPA, setOldCGPA] = React.useState(4.00)

  // Theory: 4 × 3.0 = 12.0
  // Lab: 1.5 + 1.5 + 1.5 + 2.0 (Project/Thesis) = 6.5
  // Total: 18.5
  // Previous credits through 3-2: 94.5 + 19.5 = 114
  const PREV_CREDITS = 114;
  const CURRENT_CREDITS = 18.5;

  let totalPoints =
    3.0 * (
      parseFloat(AI) +
      parseFloat(MathStats) +
      parseFloat(ML) +
      parseFloat(DataScience)
    ) +
    1.5 * parseFloat(AILab) +
    1.5 * parseFloat(MLLab) +
    1.5 * parseFloat(InternetProgLab) +
    2.0 * parseFloat(ProjectThesis);

  let gpa = totalPoints / CURRENT_CREDITS;
  gpa = gpa.toFixed(2);

  let cgpa = (totalPoints + (OldCGPA * PREV_CREDITS)) / (CURRENT_CREDITS + PREV_CREDITS);
  cgpa = cgpa.toFixed(2);

  return (
    <Box sx={{ paddingX: 1 }}>
      <Grid zIndex={1} style={{ position: 'fixed', width: '100vw', left: '50%', transform: 'translate(-50%, 0%)', backgroundColor: 'white' }} >
        <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column' }}  >
          <p className='m-auto  h2'>CGPA Calculator</p>
          <p className='m-auto  h6'>CSEDU28 4-1 (Semester VII)</p>
        </Box>
        <Box marginTop={2} display={'flex'} flexDirection={'row'} justifyContent={"space-evenly"}>

          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>4-1 GPA: {gpa}</Typography>
          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>CGPA: {cgpa}</Typography>
        </Box>
      </Grid>
      <Grid marginBottom={1} style={{ paddingTop: '150px' }} alignItems={"center"} display={'flex'} flexDirection={"column"}>
        <PrevCGPA setCGPA={setOldCGPA}></PrevCGPA>
      </Grid>
      <Grid container justifyContent={'space-around'} marginBottom={5}  >
        <Grid width={{ xs: "100%", md: "69%" }}>
          <TheorySubject SubjectName={"Artificial Intelligence"} returnGradePoint={setAI}></TheorySubject>
          <TheorySubject SubjectName={"Mathematical and Statistical Analysis for Engineers"} returnGradePoint={setMathStats}></TheorySubject>
          <TheorySubject SubjectName={"Introduction To Machine Learning"} returnGradePoint={setML}></TheorySubject>
          <TheorySubject SubjectName={"Introduction to Data Science"} returnGradePoint={setDataScience}></TheorySubject>
        </Grid>
        <Grid width={{ xs: "100%", md: "28%" }} marginBottom={5}  >
          <LabSubject SubjectName={"Artificial Intelligence Lab"} returnGradePoint={setAILab}></LabSubject>
          <LabSubject SubjectName={"Introduction to Machine Learning Lab"} returnGradePoint={setMLLab}></LabSubject>
          <LabSubject SubjectName={"Internet Programming Lab"} returnGradePoint={setInternetProgLab}></LabSubject>
          <LabSubject SubjectName={"Project/Thesis"} returnGradePoint={setProjectThesis}></LabSubject>
        </Grid>
      </Grid>
    </Box >)
}
