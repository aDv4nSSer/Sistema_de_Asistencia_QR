import { Card, CardContent, Skeleton, Box } from '@mui/material';

const SkeletonCard = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Skeleton variant="text" width={210} height={32} />
            <Skeleton variant="text" width={150} height={20} />
          </Box>
          <Skeleton variant="rectangular" width={110} height={36} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
