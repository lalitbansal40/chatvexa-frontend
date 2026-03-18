import { useEffect, useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
// material-ui
import { useTheme, styled, Theme } from '@mui/material/styles';
import {
  Box,
  ClickAwayListener,
  Collapse,
  Dialog,
  Grid,
  Menu,
  MenuItem,
  Popper,
  Stack,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';

// third party
import
EmojiPicker,
{
  SkinTones,
  EmojiClickData
} from 'emoji-picker-react';

// project import
import ChatDrawer from 'sections/ChatDrawer';
import ChatHistory from 'sections/ChatHistory';
import UserAvatar from 'sections/UserAvatar';
import UserDetails from 'sections/UserDetails';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
import { PopupTransition } from 'components/@extended/Transitions';

import { dispatch, useSelector } from 'store';
// import { openDrawer } from 'store/reducers/menu';
import { openSnackbar } from 'store/reducers/snackbar';
import { getUserChats } from 'store/reducers/chat';

// assets
import {
  AudioMutedOutlined,
  DeleteOutlined,
  DownloadOutlined,
  // MoreOutlined,
  // PaperClipOutlined,
  // PictureOutlined,
  // SendOutlined,
  SmileOutlined,
  // SoundOutlined
} from '@ant-design/icons';

// types
import { History as HistoryProps } from 'types/chat';
import { UserProfile } from 'types/user-profile';
import { ThemeMode } from 'types/config';
import { messageService } from 'service/message.service';

const drawerWidth = 320;

const Main = styled('main', { shouldForwardProp: (prop: string) => prop !== 'open' })(
  ({ theme, open }: { theme: Theme; open: boolean }) => ({
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: `-${drawerWidth}px`,
    [theme.breakpoints.down('lg')]: {
      paddingLeft: 0,
      marginLeft: 0
    },
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.shorter
      }),
      marginLeft: 0
    })
  })
);

const Chat = () => {
  const theme = useTheme();
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const bottomRef = useRef<any>(null);
  const scrollRef = useRef<any>(null);
  const matchDownSM = useMediaQuery(theme.breakpoints.down('lg'));
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const [emailDetails, setEmailDetails] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [data, setData] = useState<HistoryProps[]>([]);
  const chatState = useSelector((state: any) => state?.chat || {});
  const [anchorEl, setAnchorEl] = useState<Element | ((element: Element) => Element) | null | undefined>(null);

  // const handleClickSort = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
  //   setAnchorEl(event?.currentTarget);
  // };

  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  const handleUserChange = () => {
    setEmailDetails((prev) => !prev);
  };

  const [openChatDrawer, setOpenChatDrawer] = useState(true);
  const handleDrawerOpen = () => {
    setOpenChatDrawer((prevState) => !prevState);
  };

  const [anchorElEmoji, setAnchorElEmoji] = useState<any>(); /** No single type can cater for all elements */

  const handleOnEmojiButtonClick = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorElEmoji(anchorElEmoji ? null : event?.currentTarget);
  };

  // handle new message form
  const [message, setMessage] = useState('');
  const textInput = useRef(null);

  const handleOnSend = async () => {
    if (!message.trim()) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Message required',
          variant: 'alert',
          alert: { color: 'error' },
          close: false
        })
      );
      return;
    }

    if (!user?._id || !user?.channel_id) return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      direction: "OUT",
      type: "text",
      payload: { text: message },
      createdAt: new Date().toISOString()
    };

    // optimistic UI
    setData((prev) => [...prev, tempMessage as any]);

    const text = message;
    setMessage("");

    try {
      await messageService.sendMessage({
        channelId: user.channel_id,
        contactId: user._id,
        text
      });

    } catch (err) {
      console.error(err);

      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to send message',
          variant: 'alert',
          alert: { color: 'error' },
          close: false
        })
      );
    }
  };

  const loadOlderMessages = async () => {
    if (!cursor || loadingMore || !user?._id) return;

    try {
      setLoadingMore(true);

      const res = await messageService.getMessages(user._id, cursor);

      setData((prev) => [...res.data, ...prev]); // prepend old messages
      setCursor(res.nextCursor || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };


  // handle emoji
  const onEmojiClick = (emojiObject: EmojiClickData, event: MouseEvent) => {
    setMessage(message + emojiObject.emoji);
  };

  const emojiOpen = Boolean(anchorElEmoji);
  const emojiId = emojiOpen ? 'simple-popper' : undefined;

  const handleCloseEmoji = () => {
    setAnchorElEmoji(null);
  };

  // close sidebar when widow size below 'md' breakpoint
  useEffect(() => {
    setOpenChatDrawer(!matchDownSM);
  }, [matchDownSM]);

  // useEffect(() => {
  //   if (chatState?.user) {
  //     setUser(chatState.user);
  //   }
  // }, [chatState?.user]);

  useEffect(() => {
    if (chatState?.chats) {
      setData(chatState.chats);
    }
  }, [chatState?.chats]);

  // useEffect(() => {
  //   // hide left drawer when email app opens
  //   dispatch(openDrawer(false));
  //   dispatch(getUser(1));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (user?.name) {
      dispatch(getUserChats(user.name));
    }
  }, [user?.name]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await messageService.getMessages(user?._id || '');

      setData(res.data);
      setCursor(res.nextCursor || null);
    };

    if (user?._id) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop === 0) {
        loadOlderMessages();
      }
    };

    el.addEventListener('scroll', handleScroll);

    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  return (
    <Box sx={{ display: 'flex' }}>
      <ChatDrawer openChatDrawer={openChatDrawer} handleDrawerOpen={handleDrawerOpen} setUser={setUser} />
      <Main theme={theme} open={openChatDrawer}>
        <Grid container>
          <Grid
            item
            xs={12}
            md={emailDetails ? 8 : 12}
            xl={emailDetails ? 9 : 12}
            sx={{
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.shorter + 200
              })
            }}
          >
            <MainCard
              content={false}
              sx={{
                bgcolor: theme.palette.mode === ThemeMode.DARK ? 'dark.main' : 'grey.50',
                pt: 2,
                pl: 2,
                borderRadius: emailDetails ? '0' : '0 4px 4px 0',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.shorter + 200
                })
              }}
            >
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={12}
                  sx={{ bgcolor: theme.palette.background.paper, pr: 2, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
                >
                  <Grid container justifyContent="space-between">
                    <Grid item>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <UserAvatar
                          user={{
                            online_status: user?.online_status,
                            avatar: user?.avatar,
                            name: user?.name
                          }}
                        />
                        <Stack>
                          <Typography variant="subtitle1">{user?.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user?.phone}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item>
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                        {/* <IconButton onClick={handleClickSort} size="large" color="secondary">
                          <MoreOutlined />
                        </IconButton> */}
                        <Menu
                          id="simple-menu"
                          //   anchorEl={anchorEl}
                          keepMounted
                          open={Boolean(anchorEl)}
                          onClose={handleCloseSort}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                          }}
                          sx={{
                            p: 0,
                            '& .MuiMenu-list': {
                              p: 0
                            }
                          }}
                        >
                          <MenuItem onClick={handleCloseSort}>
                            <DownloadOutlined style={{ paddingRight: 8 }} />
                            <Typography>Archive</Typography>
                          </MenuItem>
                          <MenuItem onClick={handleCloseSort}>
                            <AudioMutedOutlined style={{ paddingRight: 8 }} />
                            <Typography>Muted</Typography>
                          </MenuItem>
                          <MenuItem onClick={handleCloseSort}>
                            <DeleteOutlined style={{ paddingRight: 8 }} />
                            <Typography>Delete</Typography>
                          </MenuItem>
                        </Menu>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <SimpleBar
                    scrollableNodeProps={{ ref: scrollRef }}
                    sx={{
                      overflowX: 'hidden',
                      height: 'calc(100vh - 410px)',
                      minHeight: 420
                    }}
                  >
                    <Box sx={{ pl: 1, pr: 3 }}>

                      {/* Loader for pagination */}
                      {loadingMore && (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 1
                          }}
                        >
                          <CircularProgress size={20} />
                        </Box>
                      )}

                      <ChatHistory theme={theme} user={user ?? {}} data={data} />

                      {/* Scroll target */}
                      <div ref={bottomRef} />

                    </Box>
                  </SimpleBar>
                </Grid>
                <Grid item xs={12} sx={{ mt: 3, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <TextField
                      inputRef={textInput}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Your Message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value.length <= 1 ? e.target.value.trim() : e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleOnSend();
                        }
                      }}
                      variant="standard"
                      sx={{
                        pr: 2,
                        '& .MuiInput-root:before': { borderBottomColor: theme.palette.divider }
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" sx={{ py: 2, ml: -1 }}>
                        <>
                          <IconButton
                            ref={anchorElEmoji}
                            aria-describedby={emojiId}
                            onClick={handleOnEmojiButtonClick}
                            sx={{ opacity: 0.5 }}
                            size="medium"
                            color="secondary"
                          >
                            <SmileOutlined />
                          </IconButton>
                          <Popper
                            id={emojiId}
                            open={emojiOpen}
                            anchorEl={anchorElEmoji}
                            disablePortal
                            style={{ zIndex: 1200 }}
                            popperOptions={{
                              modifiers: [
                                {
                                  name: 'offset',
                                  options: {
                                    offset: [-20, 125]
                                  }
                                }
                              ]
                            }}
                          >
                            <ClickAwayListener onClickAway={handleCloseEmoji}>
                              <MainCard elevation={8} content={false}>
                                <EmojiPicker onEmojiClick={onEmojiClick} defaultSkinTone={SkinTones.DARK} autoFocusSearch={false} />
                              </MainCard>
                            </ClickAwayListener>
                          </Popper>
                        </>
                        {/* <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
                          <PaperClipOutlined />
                        </IconButton>
                        <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
                          <PictureOutlined />
                        </IconButton>
                        <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
                          <SoundOutlined />
                        </IconButton>
                      </Stack>
                      <IconButton color="primary" onClick={handleOnSend} size="large" sx={{ mr: 1.5 }}>
                        <SendOutlined />
                      </IconButton> */}
                      </Stack>
                    </Stack>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} md={4} xl={3} sx={{ overflow: 'hidden', display: emailDetails ? 'flex' : 'none' }}>
            <Collapse orientation="horizontal" in={emailDetails && !matchDownMD}>
              <UserDetails user={user ?? {}} onClose={handleUserChange} />
            </Collapse>
          </Grid>

          <Dialog TransitionComponent={PopupTransition} onClose={handleUserChange} open={matchDownMD && emailDetails} scroll="body">
            <UserDetails user={user ?? {}} onClose={handleUserChange} />
          </Dialog>
        </Grid>
      </Main>
    </Box>
  );
};

export default Chat;
