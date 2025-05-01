import { useEffect, useState, ChangeEvent } from 'react'
import Card, { type CardProps } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import ChatHistory from './ChatHistory'
import { usGenerativeChatStore } from '../store/generativeChatStore'
import useDebounce from '../../../utils/hooks/useDebounce'
import classNames from '../../../utils/classNames'
import { TbSearch } from 'react-icons/tb'
import { Link, useNavigate } from 'react-router-dom'
import { useSessionUser } from '../../../store/authStore'
// Removed unused import: useUserStore
// Removed import for AppointmentPopup as the module could not be found
import UploadMedicalReports from '../../../components/shared/UploadMedicalReports'
// import { apiGetPatientAppointment } from '../../services/AppointmentService'
// Ensure the correct path or remove the import if unused
import useSWR from 'swr'
import { Badge } from '../../../components/ui'
// import TextEllipse from '../../../components/ui/TextEllipse'
//import TextEllipse from '../../../components/ui/TextEllipse'
// import TextEllipse from '../../../components/ui/TextEllipse'; // Updated path to the correct location

import { useAuthStore } from '../../../components/layouts/AuthLayout/store/useAuthStore'
// Removed import for useHcfHomeStore as the module could not be found
// Removed import for useAppointmentListStore as the module could not be found
import useResponsive from '../../../utils/hooks/useResponsive'
// Removed import for SkeletonLoader as the module could not be found
import { useAuth } from '../../../auth'
// import AppointmentsIcon from '../../../assets/svg/AppointmentsIcon'
// Ensure the file exists at the specified path or update the path to the correct location
// import TreatmentPlanIcon from '../../../assets/svg/TreatmentPlanIcon'
// import MedicalInfoIcon from '../../../assets/svg/MedicalInfoIcon'
// import TravelDetailsIcon from '../../../assets/svg/TravelDetailsIcon'
// Ensure the file exists at the specified path or update the path to the correct location
// import OtherDetailsIcon from '../../../assets/svg/OtherDetailsIcon'

type ChatSideNavProps = Pick<CardProps, 'className' | 'bodyClass'> & {
    onClick?: () => void
}

const statusColors = {
    inquiry: 'bg-gray-400',         // Neutral gray for inquiry
    planning: 'bg-blue-400',        // Blue for planning
    post_treatment: 'bg-purple-500',// Purple for post-treatment
    assessment: 'bg-yellow-400',    // Yellow for assessment
    completed: 'bg-green-500',      // Green for completed
    scheduled: 'bg-teal-500',       // Teal for scheduled
    in_treatment: 'bg-red-500',     // Red for in-treatment
};

const ChatSideNav = ({ className, bodyClass, onClick }: ChatSideNavProps) => {
    const [queryText, setQueryText] = useState('')
    const user = useSessionUser((state: any) => state.user);
    const [uploadReportPopupStatus, setUploadReportPopupStatus] = useState(false)
    // Removed usage of useUserStore due to missing file
    const userDetails: { stage?: string } | null = { stage: undefined }
    const { hcfData } = useAuthStore()
    const { smaller } = useResponsive()

    // Removed usage of useAppointmentListStore due to missing file
    const setAppointmentList = (_data: any) => {};
    const appointmentList: any[] = [];
    const [data, setData] = useState<any[]>([])

    const navigate = useNavigate();
    const { authenticated } = useAuth()

    const { setSelectedConversation, setSuggestedQuestions, setConversationMessages } = usGenerativeChatStore()

    function handleDebounceFn(e: ChangeEvent<HTMLInputElement>) {
        setQueryText?.(e.target.value)
    }

    const debounceFn = useDebounce(handleDebounceFn, 500)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        debounceFn(e)
    }

    const handleNewChat = () => {
        setSelectedConversation('')
        setSuggestedQuestions([])
        setConversationMessages([])
        navigate(`/chat-bot`)
        // onClick?.()
    }


    const { data: appointmentNewData, isLoading } = useSWR(
        [`/api/appointments/${user.authId}`],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_]) =>
            apiGetPatientAppointment({ pageIndex: 1, pageSize: 4, query: '' }),
        {
            revalidateOnFocus: false,
        },
    )

    useEffect(() => {
        if (appointmentNewData?.data?.length > appointmentList?.length) {
            setAppointmentList(appointmentNewData.data)
        }
    }, [appointmentNewData])


    useEffect(() => {
        setData(appointmentList.slice(0, 4))
    }, [appointmentList])

    const [historyVH, setHistoryVH] = useState(0)

    useEffect(() => {
        const firstCard = document.querySelector('.short-cart-menu') as HTMLElement | null;
        const handleVh = () => {
            if (firstCard) {
                const heightInPx = firstCard.offsetHeight;
                // Use a more stable way to calculate vh
                const vh = (heightInPx / document.documentElement.clientHeight) * 100;

                if (smaller.lg) {
                    setHistoryVH(100 - vh + 8);
                } else {
                    setHistoryVH(100 - vh);
                }
            }
        };

        const handleResize = () => {
            requestAnimationFrame(handleVh); // Avoid layout thrashing
        };

        handleVh(); // Initial call

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [data, smaller.lg]);


    return (
        <div className='flex flex-col gap-y-2 h-full mt-[1%] !sticky top-[10px]'>
            <Card bodyClass='px-3 short-cart-menu' className='rounded-[5px] xl:max-w-[320px]'>

                <div className='flex mb-[10px] items-center gap-x-[10px]'>
                    <p>Stage:</p>
                    <Badge
                        className={`${statusColors[userDetails?.stage as keyof typeof statusColors ?? 'inquiry'] || 'bg-gray-300'} capitalize`} // Default gray if status is unknown
                        content={userDetails?.stage ? userDetails?.stage.replace('_', ' ') : 'inquiry'} // Replace underscores with spaces for better readability
                    />
                </div>
                {
                    (user?.role?.[0] === 'patient') && (
                        <Button className='rounded-[5px]' block onClick={() => setUploadReportPopupStatus(true)}>
                            Upload Reports
                        </Button>
                    )
                }
                {
                    isLoading ? (
                        <div className='flex flex-col gap-y-[10px]'>
                            <div className='h-[25px] bg-gray-300 rounded-md'></div>
                            <div className='h-[25px] bg-gray-300 rounded-md'></div>
                        </div>
                    ) : data?.length ? (
                        <div className='mt-3'>
                            <h6>Appointments:</h6>
                            <div className='flex flex-col gap-y-[10px] mt-1 ml-1'>
                                {
                                    data.slice(0, 1)?.map((data: any, i: number) => (
                                        <div className='flex items-center justify-between w-full' key={i}>
                                            <span className='font-bold capitalize'>{data?.doctorName?.length > 18 ? `${data?.doctorName.slice(0, 15)}...` : data?.doctorName || 'N/A'}</span>
                                            <Badge
                                                className={`${data?.status === 'pending'
                                                    ? 'bg-yellow-400'
                                                    : data?.status === 'completed'
                                                        ? 'bg-green-500'
                                                        : data?.status === 'canceled'
                                                            ? 'bg-red-500'
                                                            : data?.status === 'confirmed'
                                                                ? 'bg-blue-500'
                                                                : 'bg-gray-300'
                                                    } capitalize`}
                                                content={data?.status}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                            {
                                data?.length > 1 && (
                                    <Link
                                        className='w-full rounded-[5px] mt-2 text-primary hover:underline text-center table mx-auto'
                                        to={`/patient/profile`}
                                    >
                                        Load More
                                    </Link>
                                )
                            }
                        </div>
                    ) : (
                        <div>
                            <Button
                                type="button"
                                className='w-full rounded-[5px] mt-2'
                                block
                            >
                                <span className="block md:hidden">Appointment</span>
                                <span className="hidden md:block">Book Appointment</span>
                            </Button>
                        </div>
                    )
                }
                <a href={`https://api.whatsapp.com/send?phone=${hcfData?.phone || hcfData?.auth?.phoneNumber}&text=Hi!%20Dear,%20I%20have%20a%20inquiry`} target='_blank' rel='noreferrer' className='rounded-[5px] mt-2 block w-full py-3 border-[1px] text-center'>
                    Contact HCF
                </a>

                {
                    authenticated && (
                        <div className='mt-2'>
                            <div className='flex flex-col gap-y-[10px] mt-1 ml-1'>
                                <Link to={`/patient/profile`} className='flex items-center gap-x-[10px] w-full transition-all duration-300 hover:!gap-x-[15px]'>
                                    {/* Replace with a placeholder or alternative content */}
                                    <span className="icon-placeholder">📅</span>
                                    <p className='!mt-0 !mb-1 text-primary font-semibold'>Appointments</p>
                                </Link>
                                <Link to={`/patient/profile?type=treatment-plan`} className='flex items-center gap-x-[10px] w-full transition-all duration-300 hover:!gap-x-[15px]'>
                                    <p className='!mt-0 text-primary font-semibold'>Treatment Plan</p>
                                </Link>
                                <Link to={`/patient/profile?type=medical-info`} className='flex items-center gap-x-[10px] w-full transition-all duration-300 hover:!gap-x-[15px]'>
                                    <p className='!mt-0 text-primary font-semibold'>Medical Info</p>
                                </Link>
                                <Link to={`/patient/profile?type=travel-info`} className='flex items-center gap-x-[10px] w-full transition-all duration-300 hover:!gap-x-[15px]'>
                                    <span className="icon-placeholder">✈️</span> {/* Replace with an appropriate icon or placeholder */}
                                    <p className='!mt-0 text-primary font-semibold'>Travel Info</p>
                                </Link>
                                {/* <Link to={`/patient/profile?type=other-info`} className='flex items-center gap-x-[10px] w-full transition-all duration-300 hover:!gap-x-[15px]'>
                                    <OtherDetailsIcon />
                                    <p className='!mt-0 text-primary font-semibold'>Other Info</p>
                                </Link> */}
                            </div>
                        </div>
                    )
                }
            </Card>
            <Card
                header={{
                    content: (
                        <div className="flex items-center gap-2 px-5 w-full h-[40px] md:h-[60px] xl:border-0 border-t-2">
                            <TbSearch className="text-xl" />
                            <input
                                className="flex-1 h-full placeholder:text-gray-400 placeholder:text-base bg-transparent focus:outline-none heading-text"
                                placeholder="Search chat"
                                onChange={handleInputChange}
                            />
                        </div>
                    ),
                    className: 'p-0',
                }}
                style={{ maxHeight: `${historyVH - 10}vh` }}
                className={classNames('flex-1 xl:max-w-[320px] rounded-[5px] relative overflow-hidden', className)}
                bodyClass={classNames(`${authenticated ? 'h-[calc(100%-120px)' : 'h-[80vh]'}] p-0`, bodyClass)}
            >
                <ChatHistory vh={historyVH} queryText={queryText} onClick={onClick} />
                <div className="px-2 flex flex-col gap-y-[10px] absolute bottom-1 w-full">
                    {
                        user?.role?.[0] === 'patient' && (
                            <Button className='rounded-[5px]' block variant="solid" onClick={handleNewChat}>
                                New chat
                            </Button>
                        )
                    }
                    {uploadReportPopupStatus && <UploadMedicalReports setPopupStatus={setUploadReportPopupStatus} />}
                </div>
            </Card>
        </div>
    )
}

async function apiGetPatientAppointment({ pageIndex, pageSize, query }: { pageIndex: number; pageSize: number; query: string }) {
    try {
        const response = await fetch(`/api/appointments?pageIndex=${pageIndex}&pageSize=${pageSize}&query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching appointments: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch patient appointments:', error);
        throw error;
    }
}

export default ChatSideNav;
// Removed duplicate implementation of apiGetPatientAppointment

