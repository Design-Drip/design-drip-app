interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="bg-[url(/auth-bg.jpg)] bg-top bg-cover h-screen flex flex-col">
      <div className="z-[4] h-full w-full">
        <div className="h-full w-full flex items-center justify-center">
          {children}
        </div>
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.8),rgba(0,0,0,.4),rgba(0,0,0,.8))] z-[1]" />
    </div>
  );
};

export default AuthLayout;
