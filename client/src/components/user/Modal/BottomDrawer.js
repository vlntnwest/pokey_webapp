import React from "react";
import {
  motion,
  useAnimate,
  useDragControls,
  useMotionValue,
} from "framer-motion";

const backgroundStyle = {
  position: "fixed",
  zIndex: 50,
  backgroundColor: "rgba(0,0,0,0.5)",
  width: "100vw",
  height: "100vh",
  top: 0,
  left: 0,
};

const childrenStyle = {
  position: "relative",
  zIndex: 0,
  height: "100dvh",
  "&::WebkitScrollbar": {
    display: "none",
  },
  MsOverflowStyle: "none",
  scrollbarWidth: "none",
  display: "flex",
  flexDirection: "column",
};

// const btnContainerStyle = {
//   position: "absolute",
//   left: 0,
//   right: 0,
//   zIndex: 10,
//   display: "flex",
//   justifyContent: "center",
//   padding: "8px",
//   height: "10%",
//   touchAction: "none",
// };

const BottomDrawer = ({ open, setOpen, children }) => {
  const [scope, animate] = useAnimate();
  const controls = useDragControls();
  const y = useMotionValue(0);

  const handleClose = async () => {
    animate(scope.current, {
      opacity: [1, 0],
    });

    const yStart = typeof y.get() === "number" ? y.get() : 0;

    await animate("#drawer", {
      y: [yStart, 500],
    });
    setOpen(false);
  };

  return (
    <>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleClose}
          ref={scope}
          style={backgroundStyle}
        >
          <motion.div
            id="drawer"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{
              ease: "easeInOut",
            }}
            onDragEnd={() => {
              if (y.get() >= 100) {
                handleClose();
              }
            }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.5,
            }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "100vh",
              overflow: "hidden",
              backgroundColor: "#fff",
              // borderTopLeftRadius: 10,
              // borderTopRightRadius: 10,
              y,
            }}
          >
            {/* <div
              onPointerDown={(e) => {
                controls.start(e);
              }}
              style={btnContainerStyle}
            ></div> */}
            <div style={childrenStyle}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default BottomDrawer;
