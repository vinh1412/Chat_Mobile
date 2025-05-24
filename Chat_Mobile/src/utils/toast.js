
export const showFriendRequestToast = ({response, toast}) => {
    if (response) {
    //   const { senderId } = response.response;
    console.log('response toast ------: ', response);
      toast.show('Bạn có yêu cầu kết bạn mới', { type: 'success' });
    } else {
      toast.show(`Lỗi`, { type: 'danger' });
    }
}