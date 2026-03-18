import { useState } from 'react';

// material-ui
import {
  Button,
  Divider,
  CardContent,
  Modal,
  Stack,
  TextField,
  Box
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import { contactService } from 'service/contact.service';

// phone input
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// formik
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface CreateContactModalProps {
  contactModalOpen: boolean;
  handleClose: () => void;
  channelId: string;
  contactCreateRefresh: () => void;
}

export const CreateContactModal = ({
  contactModalOpen,
  handleClose,
  channelId,
  contactCreateRefresh
}: CreateContactModalProps) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      phone: ''
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full Name is required'),
      phone: Yup.string().required('Phone is required')
    }),
    validateOnMount: true, // 🔥 important for initial disable
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);

        const finalPhone = `+${values.phone}`;

        await contactService.createContact(channelId, values.fullName, finalPhone);

        resetForm();
        handleClose();
        contactCreateRefresh();
      } catch (error) {
        console.error(error);
        alert('Failed to create contact');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Modal open={contactModalOpen} onClose={handleClose}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          p: 2,
          overflow: 'visible'
        }}
      >
        <MainCard
          title="Add New Contact"
          modal
          darkTitle
          content={false}
          sx={{
            width: { xs: '95%', sm: 600 },
            borderRadius: 3,
            boxShadow: 10,
            overflow: 'visible'
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            <CardContent>
              <Stack spacing={3}>

                {/* FULL NAME */}
                <TextField
                  label="Full Name"
                  fullWidth
                  name="fullName"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 50
                    }
                  }}
                />

                {/* PHONE INPUT */}
                <Box
                  sx={{
                    '& .react-tel-input': {
                      width: '100%'
                    },
                    '& .react-tel-input .form-control': {
                      width: '100% !important',
                      height: '56px !important',
                      borderRadius: '12px !important',
                      fontSize: '16px !important'
                    },
                    '& .react-tel-input .country-list': {
                      zIndex: 9999,
                      borderRadius: '12px',
                      maxHeight: '300px'
                    },
                    '& .react-tel-input .search-box': {
                      height: '40px',
                      borderRadius: '8px'
                    }
                  }}
                >
                  <PhoneInput
                    country={'in'}
                    enableSearch
                    value={formik.values.phone}
                    onChange={(value) => formik.setFieldValue('phone', value)}
                    dropdownStyle={{
                      zIndex: 9999
                    }}
                  />
                </Box>

                {/* PHONE ERROR */}
                {formik.touched.phone && formik.errors.phone && (
                  <span style={{ color: 'red', fontSize: 12 }}>
                    {formik.errors.phone}
                  </span>
                )}

              </Stack>
            </CardContent>

            <Divider />

            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ px: 2.5, py: 2 }}
            >
              <Button color="error" size="small" onClick={handleClose}>
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={
                  loading ||
                  !formik.values.fullName ||
                  !formik.values.phone ||
                  !formik.isValid
                }
              >
                {loading ? 'Creating...' : 'Submit'}
              </Button>
            </Stack>
          </form>
        </MainCard>
      </Box>
    </Modal>
  );
};