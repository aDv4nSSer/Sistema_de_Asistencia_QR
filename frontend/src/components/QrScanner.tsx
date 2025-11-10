import { useZxing } from 'react-zxing';
import { Box, Typography } from '@mui/material';

interface QrScannerProps {
  onScanSuccess: (token: string) => void;
}

const QrScanner = ({ onScanSuccess }: QrScannerProps) => {
  const { ref } = useZxing({
    // 👇 === LA MODIFICACIÓN ESTÁ AQUÍ ===
    // Le pedimos al navegador que use la cámara trasera (la que apunta al "entorno")
    constraints: {
      video: {
        facingMode: 'environment'
      }
    },
    // ======================================

    onDecodeResult(result) {
      onScanSuccess(result.getText());
    },
    onError(error) {
      console.error('Error en el scanner:', error);
      // Opcional: podrías mostrar un mensaje de error al usuario aquí
    },
  });

  return (
    <Box sx={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
      <Typography variant="body1" align="center" gutterBottom>
        Apunta la cámara al código QR
      </Typography>
      {/* El hook 'useZxing' se conecta a este elemento de video */}
      <video ref={ref} style={{ width: '100%' }} />
    </Box>
  );
};

export default QrScanner;