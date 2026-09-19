import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ClockPickerProps {
  open: boolean;
  title: string;
  initialHour: number;
  initialMinute: number;
  onClose: () => void;
  onConfirm: (hour: number, minute: number) => void;
  clockImage: string;
}

const ROMAN_MAP = [
  { value: 12, label: 'XII' },
  { value: 1, label: 'I' },
  { value: 2, label: 'II' },
  { value: 3, label: 'III' },
  { value: 4, label: 'IV' },
  { value: 5, label: 'V' },
  { value: 6, label: 'VI' },
  { value: 7, label: 'VII' },
  { value: 8, label: 'VIII' },
  { value: 9, label: 'IX' },
  { value: 10, label: 'X' },
  { value: 11, label: 'XI' },
];

function getRoman(hour: number) {
  const found = ROMAN_MAP.find(r => r.value === hour);
  return found ? found.label : '?';
}

function getHourAngle(hour: number) {
  return (hour / 12) * 360;
}

function getMinuteAngle(minute: number) {
  return (minute / 60) * 360;
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function ClockPicker({
  open,
  title,
  initialHour,
  initialMinute,
  onClose,
  onConfirm,
  clockImage,
}: ClockPickerProps) {
  const [tempHour, setTempHour] = useState(initialHour || 9);
  const [tempMinute, setTempMinute] = useState(initialMinute || 0);
  const [currentMode, setCurrentMode] = useState<'hour' | 'minute'>('hour');
  const clockWrapperRef = useRef<HTMLDivElement>(null);
  const handHourRef = useRef<HTMLDivElement>(null);
  const handMinuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTempHour(initialHour);
      setTempMinute(initialMinute);
      setCurrentMode('hour');
    }
  }, [open, initialHour, initialMinute]);

  const updateClock = (hour: number, minute: number) => {
    if (handHourRef.current) {
      const hourAngle = getHourAngle(hour) + (minute / 60) * 30;
      handHourRef.current.style.transform = `translate(-50%, -100%) rotate(${hourAngle}deg)`;
    }
    if (handMinuteRef.current) {
      const minuteAngle = getMinuteAngle(minute);
      handMinuteRef.current.style.transform = `translate(-50%, -100%) rotate(${minuteAngle}deg)`;
    }
  };

  useEffect(() => {
    updateClock(tempHour, tempMinute);
  }, [tempHour, tempMinute]);

  const getValueFromClick = (clientX: number, clientY: number) => {
    const container = clockWrapperRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (clientX - centerX) / (rect.width / 2);
    const dy = (clientY - centerY) / (rect.height / 2);

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1 || dist > 0.95) return null;

    let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
    angleDeg = (angleDeg + 90 + 360) % 360;

    if (currentMode === 'hour') {
      let hour = Math.round(angleDeg / 30);
      if (hour === 0) hour = 12;
      return { type: 'hour', value: hour };
    } else {
      let minute = Math.round(angleDeg / 6);
      if (minute === 60) minute = 0;
      minute = Math.round(minute / 5) * 5;
      if (minute === 60) minute = 0;
      return { type: 'minute', value: minute };
    }
  };

  const handleClockClick = (event: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ('touches' in event) {
      event.preventDefault();
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const result = getValueFromClick(clientX, clientY);
    if (result) {
      if (result.type === 'hour') {
        setTempHour(result.value);
      } else {
        setTempMinute(result.value);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm(tempHour, tempMinute);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'white',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* 头部 */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* 时间预览 */}
        <Box sx={{ textAlign: 'center', mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#f5f3ff' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#333' }}>
            {formatTime(tempHour, tempMinute)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getRoman(tempHour)} 点 {String(tempMinute).padStart(2, '0')} 分
          </Typography>
        </Box>

        {/* 模式切换 */}
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          <Button
            variant={currentMode === 'hour' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setCurrentMode('hour')}
            sx={{ textTransform: 'none', borderRadius: 20, px: 3 }}
          >
            🕐 小时
          </Button>
          <Button
            variant={currentMode === 'minute' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setCurrentMode('minute')}
            sx={{ textTransform: 'none', borderRadius: 20, px: 3 }}
          >
            🕑 分钟
          </Button>
        </Stack>

        {/* 钟表 */}
        <Box
          ref={clockWrapperRef}
          onClick={handleClockClick}
          onTouchStart={handleClockClick}
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 340,
            aspectRatio: '1/1',
            mx: 'auto',
            borderRadius: '50%',
            border: '4px solid #e0e0e0',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'border-color 0.3s ease',
            touchAction: 'none',
            '&:hover': { borderColor: '#333' },
          }}
        >
          {/* 钟表图片 */}
          <Box
            component="img"
            src={clockImage}
            alt="钟表"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* 时针 */}
          <Box
            ref={handHourRef}
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '6px',
              height: '25%',
              transformOrigin: 'bottom center',
              transform: 'translate(-50%, -100%) rotate(0deg)',
              background: 'rgba(26,26,26,0.6)',
              borderRadius: '4px',
              zIndex: 10,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />

          {/* 分针 */}
          <Box
            ref={handMinuteRef}
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '2.5px',
              height: '35%',
              transformOrigin: 'bottom center',
              transform: 'translate(-50%, -100%) rotate(0deg)',
              background: 'rgba(26,26,26,0.5)',
              borderRadius: '3px',
              zIndex: 9,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />

          {/* 中心圆点 */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'rgba(26,26,26,0.5)',
              zIndex: 12,
              pointerEvents: 'none',
            }}
          />

          {/* 透明点击层 */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 20, borderRadius: '50%' }} />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          💡 点击钟表选择 {currentMode === 'hour' ? '小时' : '分钟'}
        </Typography>

        {/* 底部按钮 */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose} fullWidth sx={{ textTransform: 'none', borderRadius: 40 }}>
            取消
          </Button>
          <Button variant="contained" onClick={handleConfirm} fullWidth sx={{ textTransform: 'none', borderRadius: 40 }}>
            确定
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}