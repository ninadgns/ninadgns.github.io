import * as React from 'react';
import InputSlider from './InputSlider';
import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
export default function LabSubject({ SubjectName, returnGradePoint, examName }) {
    const [Incourse, setIncourse] = React.useState(85);

    let Mark = Incourse;
    let grade, gradePoint;
    if (Mark > 80) { grade = "A+"; gradePoint = "4.00"; }
    else if (Mark > 75) { grade = "A"; gradePoint = "3.75"; }
    else if (Mark > 70) { grade = "A-"; gradePoint = "3.50"; }
    else if (Mark > 65) { grade = "B+"; gradePoint = "3.25"; }
    else if (Mark > 60) { grade = "B"; gradePoint = "3.00"; }
    else if (Mark > 55) { grade = "B-"; gradePoint = "2.75"; }
    else if (Mark > 50) { grade = "C+"; gradePoint = "2.50"; }
    else if (Mark > 45) { grade = "C"; gradePoint = "2.25"; }
    else if (Mark > 40) { grade = "D"; gradePoint = "2.00"; }
    else { grade = "F"; gradePoint = "0.00"; }
    returnGradePoint(gradePoint)

    return (
        <Grid container sx={{ borderStyle: 'dashed', borderColor: 'lightblue' }} marginBottom={1} padding={1}>
            <Grid xs={12}>
                <Typography variant='h5'>{SubjectName}</Typography>
            </Grid>
            <Grid xs={12}>
                <InputSlider stepValue={5} defaultValue={85} maxValue={85} minValue={40} textVisibility='hidden' returnValue={setIncourse}></InputSlider>
            </Grid>
            <Grid xs={12} sx={{ marginTop: "-10px", marginBottom: "" }}>
                <p>Grade: <b>{grade}</b>   </p>
                <p>Grade Point: <b>{gradePoint}</b></p>
            </Grid>
        </Grid>)
}