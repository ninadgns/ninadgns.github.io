import * as React from 'react';
import TheorySubject from './TheorySubject'
import LabSubject from './LabSubject'
import PrevCGPA from './PrevCGPA';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { Grid } from '@mui/material';
import { Typography } from '@mui/material';

// One of these two electives is taken, each with its own lab.
const ELECTIVES = {
  datamining: {
    label: 'Data Mining',
    theory: 'CSE-4225: Introduction to Data Mining and Warehousing',
    lab: 'CSE-4255: Introduction to Data Mining and Warehousing Lab',
  },
  graphics: {
    label: 'Computer Graphics',
    theory: 'CSE-4139: Computer Graphics',
    lab: 'CSE-4169: Computer Graphics Lab',
  },
};

export default function FourTwo() {
  const [IoT, setIoT] = React.useState(4.00);
  const [Elective, setElective] = React.useState(4.00);
  const [Economics, setEconomics] = React.useState(4.00);
  const [SocietyTech, setSocietyTech] = React.useState(4.00);

  const [ElectiveLab, setElectiveLab] = React.useState(4.00);
  const [Project, setProject] = React.useState(4.00);

  const [electiveChoice, setElectiveChoice] = React.useState('datamining');
  const elective = ELECTIVES[electiveChoice];

  const [OldCGPA, setOldCGPA] = React.useState(4.00)

  // Theory: 3.0 (IoT) + 3.0 (Data Mining or Computer Graphics) + 2.0 (Economics) + 2.0 (Society & Technology) = 10.0
  // Lab: 1.5 (elective lab) + 4.0 (Project) = 5.5
  // Total: 15.5
  // Previous credits through 4-1: 114 + 18.5 = 132.5
  const PREV_CREDITS = 132.5;
  const CURRENT_CREDITS = 15.5;

  let totalPoints =
    3.0 * (parseFloat(IoT) + parseFloat(Elective)) +
    2.0 * (parseFloat(Economics) + parseFloat(SocietyTech)) +
    1.5 * parseFloat(ElectiveLab) +
    4.0 * parseFloat(Project);

  let gpa = totalPoints / CURRENT_CREDITS;
  gpa = gpa.toFixed(2);

  let cgpa = (totalPoints + (OldCGPA * PREV_CREDITS)) / (CURRENT_CREDITS + PREV_CREDITS);
  cgpa = cgpa.toFixed(2);

  return (
    <Box sx={{ paddingX: 1 }}>
      <Grid zIndex={1} style={{ position: 'fixed', width: '100vw', left: '50%', transform: 'translate(-50%, 0%)', backgroundColor: 'white' }} >
        <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column' }}  >
          <p className='m-auto  h2'>CGPA Calculator</p>
          <p className='m-auto  h6'>CSEDU28 4-2 (Semester VIII)</p>
        </Box>
        <Box marginTop={2} display={'flex'} flexDirection={'row'} justifyContent={"space-evenly"}>

          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>4-2 GPA: {gpa}</Typography>
          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>CGPA: {cgpa}</Typography>
        </Box>
      </Grid>
      <Grid marginBottom={1} style={{ paddingTop: '150px' }} alignItems={"center"} display={'flex'} flexDirection={"column"}>
        <PrevCGPA setCGPA={setOldCGPA}></PrevCGPA>
        <Box marginTop={1} display={'flex'} alignItems={'center'} gap={1} flexWrap={'wrap'} justifyContent={'center'}>
          <Typography variant='h6'>Elective:</Typography>
          <ToggleButtonGroup
            color="primary"
            value={electiveChoice}
            exclusive
            onChange={(e, value) => { if (value) setElectiveChoice(value); }}
            aria-label="Elective course"
          >
            {Object.entries(ELECTIVES).map(([key, { label }]) => (
              <ToggleButton key={key} value={key}>{label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Grid>
      <Grid container justifyContent={'space-around'} marginBottom={5}  >
        <Grid width={{ xs: "100%", md: "69%" }}>
          <TheorySubject SubjectName={"CSE-4232: Internet of Things"} returnGradePoint={setIoT}></TheorySubject>
          <TheorySubject SubjectName={elective.theory} returnGradePoint={setElective}></TheorySubject>
          <TheorySubject SubjectName={"ECO-4201: Economics"} returnGradePoint={setEconomics}></TheorySubject>
          <TheorySubject SubjectName={"CSE-4202: Society and Technology"} returnGradePoint={setSocietyTech}></TheorySubject>
        </Grid>
        <Grid width={{ xs: "100%", md: "28%" }} marginBottom={5}  >
          <LabSubject SubjectName={elective.lab} returnGradePoint={setElectiveLab}></LabSubject>
          <LabSubject SubjectName={"CSE-4214: Project"} returnGradePoint={setProject}></LabSubject>
        </Grid>
      </Grid>
    </Box >)
}
