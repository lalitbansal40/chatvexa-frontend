import { Fragment, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, List, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';

// third-party
import { Chance } from 'chance';

// project imports
import UserAvatar from './UserAvatar';
import Dot from 'components/@extended/Dot';
import { useDispatch } from 'store';
import { getUsers } from 'store/reducers/chat';

// assets
import { CheckOutlined } from '@ant-design/icons';

// types
import { UserProfile } from 'types/user-profile';
import { contactService } from 'service/contact.service';

const chance = new Chance();

interface UserListProps {
  setUser: (u: UserProfile) => void;
  search?: string;
}

function UserList({ setUser, search }: UserListProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  // const [data, setData] = useState<UserProfile[]>([]);
  // const { users } = useSelector((state:any) => state.chat);

const { data } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactService.getContacts()
  });

  useEffect(() => {
    dispatch(getUsers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // useEffect(() => {
  //   if (search) {
  //     const results = data.filter((row: KeyedObject) => {
  //       let matches = true;

  //       const properties: string[] = ['name'];
  //       let containsQuery = false;

  //       properties.forEach((property) => {
  //         if (row[property].toString().toLowerCase().includes(search.toString().toLowerCase())) {
  //           containsQuery = true;
  //         }
  //       });

  //       if (!containsQuery) {
  //         matches = false;
  //       }
  //       return matches;
  //     });

  //     setData(results);
  //   } else {
  //     setData(users);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [search]);

  return (
    <List component="nav">
      {data.map((user:any) => (
        <Fragment key={user.id}>
          <ListItemButton
            sx={{ pl: 1 }}
            onClick={() => {
              setUser(user);
            }}
          >
            <ListItemAvatar>
              <UserAvatar user={user} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack component="span" direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography
                    variant="h5"
                    color="inherit"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Typography component="span" color="textSecondary" variant="caption">
                    {user.lastMessage}
                  </Typography>
                </Stack>
              }
              secondary={
                <Stack component="span" direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.status}
                  </Typography>
                  {user.unReadChatCount ? (
                    <Dot color="primary" />
                  ) : (
                    // chance.bool() - use for last send msg was read or unread
                    <CheckOutlined style={{ color: chance.bool() ? theme.palette.grey[400] : theme.palette.primary.main }} />
                  )}
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
        </Fragment>
      ))}
    </List>
  );
}

export default UserList;
