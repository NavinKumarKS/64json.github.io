import React, { useContext, useEffect, useState } from 'react';
import './stylesheet.scss';
import { classes } from 'common/utils';
import { useHistory } from 'react-router-dom';
import { Icon, Link } from 'components';
import { ResponsiveContext } from 'contexts';

function Window({
                  className, iconProps, title, defaultWidth, defaultHeight, tabs, noToolbar, children, onKeyDown, onKeyPress,
                  onUpdate, app, style, toolbarStyle, contentStyle,
                }) {
  const {
    name, iconProps: appIconProps, url, closing, focused, defaultLeft, defaultTop, zIndex,
  } = app;

  const mobile = useContext(ResponsiveContext);

  const history = useHistory();

  const [[left, top, width, height], setCoords] = useState([defaultLeft, defaultTop, defaultWidth, defaultHeight]);
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [moving, setMoving] = useState(false);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (focused && onKeyDown) {
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [focused, onKeyDown]);

  useEffect(() => {
    if (focused && onKeyPress) {
      window.addEventListener('keypress', onKeyPress);
      return () => {
        window.removeEventListener('keypress', onKeyPress);
      };
    }
  }, [focused, onKeyPress]);

  useEffect(() => {
    if (focused && minimized) {
      setMinimized(false);
    }
  }, [focused]);

  return (
    <div
      className={classes('Window', className, noToolbar && 'no-toolbar', focused && 'focused', closing && 'closing', minimized && 'minimized', maximized && 'maximized', moving && 'moving', resizing && 'resizing')}
      style={{ ...(style || {}), zIndex, left, top, width, height }}
      onMouseDown={e => {
        e.stopPropagation();
        if (!focused) history.push(url);
      }}>
      <div className="toolbar" onMouseDown={mobile ? undefined : e => {
        if (e.button !== 0) return;
        if (maximized) return;
        setMoving(true);
        const offsetX = e.clientX;
        const offsetY = e.clientY;
        const onMouseMove = e => {
          const dx = e.clientX - offsetX;
          const dy = e.clientY - offsetY;
          setCoords([
            left + dx,
            top + dy,
            width,
            height,
          ]);
        };
        const onMouseUp = () => {
          setMoving(false);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }} style={toolbarStyle}>
        {
          mobile ? (
            <Link className="button-container" url="/" onClick={() => onUpdate({ closing: true })}>
              <div className="button button-close"/>
              <div className="button button-minimize"/>
              <div className="button button-maximize"/>
            </Link>
          ) : (
            <div className="button-container">
              <Link className="button button-close" url="/" onClick={() => onUpdate({ closing: true })}/>
              <Link className="button button-minimize" url="/" onClick={() => setMinimized(true)}/>
              <Link className="button button-maximize" url={url} onClick={() => setMaximized(!maximized)}/>
            </div>
          )
        }
        {
          tabs ? (
            <div className="tab-container">
              {tabs}
            </div>
          ) : (
            <div className="title-container">
              <Icon className="icon" {...(iconProps || appIconProps)}/>
              <div className="name">{title || name}</div>
            </div>
          )
        }
      </div>
      <div className="content" style={contentStyle}>
        {children}
        <div className="interceptor"/>
      </div>
      {
        !mobile && [
          ['top'],
          ['bottom'],
          ['left'],
          ['right'],
          ['top', 'left'],
          ['top', 'right'],
          ['bottom', 'left'],
          ['bottom', 'right'],
        ].map(sides => (
          <div key={sides.join('-')} className={classes('border', ...sides.map(side => `border-${side}`))}
               onMouseDown={e => {
                 if (e.button !== 0) return;
                 if (maximized) return;
                 setResizing(true);
                 const offsetX = e.clientX;
                 const offsetY = e.clientY;
                 const onMouseMove = e => {
                   const dx = e.clientX - offsetX;
                   const dy = e.clientY - offsetY;
                   let newLeft = left;
                   let newTop = top;
                   let newWidth = width;
                   let newHeight = height;
                   sides.forEach(side => {
                     switch (side) {
                       case 'top':
                         newTop += dy;
                         newHeight -= dy;
                         break;
                       case 'left':
                         newLeft += dx;
                         newWidth -= dx;
                         break;
                       case 'bottom':
                         newHeight += dy;
                         break;
                       case 'right':
                         newWidth += dx;
                         break;
                       default:
                     }
                   });
                   if (newWidth < 280 || newHeight < 60) return;
                   setCoords([
                     newLeft,
                     newTop,
                     newWidth,
                     newHeight,
                   ]);
                 };
                 const onMouseUp = () => {
                   setResizing(false);
                   window.removeEventListener('mousemove', onMouseMove);
                   window.removeEventListener('mouseup', onMouseUp);
                 };
                 window.addEventListener('mousemove', onMouseMove);
                 window.addEventListener('mouseup', onMouseUp);
               }}/>
        ))
      }
    </div>
  );
}

export default Window;
