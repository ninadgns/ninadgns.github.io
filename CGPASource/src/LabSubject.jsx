import * as React from 'react';
import InputSlider from './InputSlider';
import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
export default function LabSubject({ SubjectName, returnGradePoint, examName }) {
    const [labMark, setLabMark] = React.useState(50);

    let Mark = labMark;
    let grade, gradePoint;
    if (Mark >= 80/2) { grade = "A+"; gradePoint = "4.00"; }
    else if (Mark >= 75/2) { grade = "A"; gradePoint = "3.75"; }
    else if (Mark >= 70/2) { grade = "A-"; gradePoint = "3.50"; }
    else if (Mark >= 65/2) { grade = "B+"; gradePoint = "3.25"; }
    else if (Mark >= 60/2) { grade = "B"; gradePoint = "3.00"; }
    else if (Mark >= 55/2) { grade = "B-"; gradePoint = "2.75"; }
    else if (Mark >= 50/2) { grade = "C+"; gradePoint = "2.50"; }
    else if (Mark >= 45/2) { grade = "C"; gradePoint = "2.25"; }
    else if (Mark >= 40/2) { grade = "D"; gradePoint = "2.00"; }
    else { grade = "F"; gradePoint = "0.00"; }
    returnGradePoint(gradePoint)

    return (
        <Grid container sx={{ borderStyle: 'dashed', borderColor: 'lightblue' }} marginBottom={1} padding={1}>
            <Grid xs={12}>
                <Typography variant='h5'>{SubjectName}</Typography>
            </Grid>
            <Grid xs={12}>
                <InputSlider  defaultValue={50} maxValue={50} minValue={0}  returnValue={setLabMark}></InputSlider>
            </Grid>
            <Grid xs={12} sx={{ marginTop: "-10px", marginBottom: "" }}>
                <p>Grade: <b>{grade}</b>   </p>
                <p>Grade Point: <b>{gradePoint}</b></p>
            </Grid>
        </Grid>)
}