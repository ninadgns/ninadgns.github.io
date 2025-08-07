import * as React from 'react';
import TheorySubject from './TheorySubject'
import LabSubject from './LabSubject'
import PrevCGPA from './PrevCGPA';
import { Box } from '@mui/material';
import { spacing } from '@mui/system';

import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
export default function ThreeOne() {
  const [Networking, setNetworking] = React.useState(4.00);
  const [SoftwareEng, setSoftwareEng] = React.useState(4.00);
  const [Assembly, setAssembly] = React.useState(4.00);
  const [DBMSTwo, setDBMSTwo] = React.useState(4.00);
  const [MVC, setMVC] = React.useState(4.00);
  const [NetworkingLab, setNetworkingLab] = React.useState(4.00);
  const [SELab, setSELab] = React.useState(4.00);
  const [AssemblyLab, setAssemblyLab] = React.useState(4.00);
  const [MicrocontrollerLab, setMicroControllerLab] = React.useState(4.00);
  const [OldCGPA, setOldCGPA] = React.useState(4.00)
  let cgpa = 4;
  cgpa =
    3 * (
      parseFloat(Networking) +
      parseFloat(SoftwareEng) +
      parseFloat(Assembly) +
      parseFloat(DBMSTwo) +
      parseFloat(MVC)
    ) +

    1.5 * (
      parseFloat(NetworkingLab) +
      parseFloat(AssemblyLab)
    ) +

    .75 * (parseFloat(SELab) +
      parseFloat(MicrocontrollerLab))

  let gpa = cgpa / 19.5
  gpa = gpa.toFixed(2)
  cgpa += OldCGPA * 75
  cgpa /= (19.5 + 75)

  cgpa = cgpa.toFixed(2)


  return (
    <Box sx={{ paddingX: 1 }}>
      <Grid zIndex={1} style={{ position: 'fixed', width: '100vw', left: '50%', transform: 'translate(-50%, 0%)', backgroundColor: 'white' }} >
        <Box sx={{ mx: 'auto', display: 'flex', flexDirection: 'column' }}  >
          <p className='m-auto  h2'>CGPA Calculator</p>
          <p className='m-auto  h6'>CSEDU28 3-1</p>
        </Box>
        <Box marginTop={2} display={'flex'} flexDirection={'row'} justifyContent={"space-evenly"}>

          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>3-1 GPA: {gpa}</Typography>
          <Typography border={'solid red'} padding={1} width={'fit-content'} variant='h5' fontFamily={'monospace'}>CGPA: {cgpa}</Typography>
        </Box>
      </Grid>
      <Grid marginBottom={1} style={{ paddingTop: '150px' }} alignItems={"center"} display={'flex'} flexDirection={"column"}>
        <PrevCGPA setCGPA={setOldCGPA}></PrevCGPA>
      </Grid>
      <Grid container justifyContent={'space-around'} marginBottom={5}  >
        <Grid width={{ xs: "100%", md: "69%" }}>
          <TheorySubject SubjectName={"Networking"} returnGradePoint={setNetworking}></TheorySubject>
          <TheorySubject SubjectName={"Multivariable Calculus"} returnGradePoint={setMVC}></TheorySubject>
          <TheorySubject SubjectName={"DBMS II"} returnGradePoint={setDBMSTwo}></TheorySubject>
          <TheorySubject SubjectName={"Software Engineering"} returnGradePoint={setSoftwareEng}></TheorySubject>
          <TheorySubject SubjectName={"Microprocessor and Microcontroller"} returnGradePoint={setAssembly}></TheorySubject>
        </Grid>
        <Grid width={{ xs: "100%", md: "28%" }} marginBottom={5}  >
          <LabSubject SubjectName={"Networking Lab"} returnGradePoint={setNetworkingLab}></LabSubject>
          <LabSubject SubjectName={"Software Engineering Lab"} returnGradePoint={setSELab}></LabSubject>
          <LabSubject SubjectName={"Assembly Lab"} returnGradePoint={setAssemblyLab}></LabSubject>
          <LabSubject SubjectName={"STM Lab"} returnGradePoint={setMicroControllerLab}></LabSubject>
        </Grid>
      </Grid>
    </Box >)
}
