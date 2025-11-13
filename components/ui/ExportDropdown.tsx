// ExportDropdown.tsx (sửa lại để tránh lỗi mở lần 1 sai vị trí)
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from './Icon';

interface ExportDropdownProps {
  onPrint: () => void;
  onExportCsv: () => void;
  onExportWord: () => void;
}

const GAP = 8;

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onPrint, onExportCsv, onExportWord }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [opensUpward, setOpensUpward] = useState(false);
  const [measured, setMeasured] = useState(false); // đã đo xong chưa

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // đóng khi click outside & events
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        isOpen &&
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setMeasured(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setMeasured(false);
      }
    };

    window.addEventListener('resize', handleWindowChange);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen]);

  function handleWindowChange() {
    // khi resize/scroll, nếu menu đang mở, cần recalc vị trí
    if (isOpen) {
      recalcPosition();
    }
  }

  function recalcPosition() {
    const btn = buttonRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    const rect = btn.getBoundingClientRect();
    // menu.getBoundingClientRect() bây giờ trả ra kích thước thực vì menu đã mount (mặc định ẩn bằng visibility)
    const menuRect = menu.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const willOpenUp = spaceBelow < menuRect.height && spaceAbove > spaceBelow;

    let left = rect.right - menuRect.width;
    if (left < 8) left = 8;
    if (left + menuRect.width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - menuRect.width - 8);
    }

    let top: number;
    if (willOpenUp) {
      top = rect.top - menuRect.height - GAP;
    } else {
      top = rect.bottom + GAP;
    }

    if (top < 8) top = 8;
    if (top + menuRect.height > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - menuRect.height - 8);
    }

    setOpensUpward(willOpenUp);
    setMenuStyle({
      position: 'fixed',
      top: Math.round(top),
      left: Math.round(left),
      minWidth: rect.width,
      zIndex: 10000,
    });
  }

  // đo và đặt vị trí SẴN TRƯỚC KHI PAINT: useLayoutEffect chạy sync trước painting
  useLayoutEffect(() => {
    if (!isOpen) return;

    // Khi mở lần đầu, measured=false. Ta render menu ở trạng thái hidden (visibility:hidden)
    // để browser mount nó, rồi đo kích thước ngay trong useLayoutEffect và set style.
    // Sau khi đo xong, bật measured=true để hiển thị menu.
    recalcPosition();
    // đảm bảo hiển thị sau khi recalc
    setMeasured(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setMeasured(false);
    } else {
      setIsOpen(true);
      // measured sẽ set true trong useLayoutEffect sau khi đo
    }
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
    setMeasured(false);
  };

  // menu được render vào body qua portal. Khi chưa đo xong, menu vẫn mount nhưng ẩn (visibility:hidden)
  const menu = (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      className="rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{
        // khi chưa đo xong: ẩn để tránh nháy; sau đo: áp dụng vị trí tính được
        visibility: measured ? 'visible' : 'hidden',
        pointerEvents: measured ? 'auto' : 'none',
        ...menuStyle,
        transformOrigin: opensUpward ? 'bottom right' : 'top right',
      }}
    >
      <div className="py-1">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleAction(onPrint); }}
          className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100"
          role="menuitem"
        >
          <Icon type="printer" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          In / Lưu dạng PDF
        </a>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleAction(onExportWord); }}
          className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100"
          role="menuitem"
        >
          <Icon type="document-text" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Xuất ra Word (.doc)
        </a>

        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleAction(onExportCsv); }}
          className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100"
          role="menuitem"
        >
          <Icon type="document-arrow-down" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Xuất ra Excel
        </a>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          className="btn-secondary inline-flex w-full justify-center gap-x-1.5"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          Xuất & In
          <Icon type="chevron-down" className="-mr-1 h-5 w-5 text-gray-400" />
        </button>
      </div>

      {isOpen && ReactDOM.createPortal(menu, document.body)}
    </div>
  );
};

export default ExportDropdown;
