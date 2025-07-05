import SignOut from "../components/dynamicDialogs/SignOut.vue";

export const AuthService = {
  beginSignOutFlow: (dialog: any) => {
    dialog.open(SignOut, {
      props: {
        header: "Sign Out",
        modal: true,
        dismissableMask: true,
      },
    });
  },
};
