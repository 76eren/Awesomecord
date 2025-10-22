using Application.DTOs;
using AutoMapper;
using Domain;

namespace Application.Users.Commands;

public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();

        CreateMap<Conversation, ConversationDto>()
            .ForMember(dest => dest.title,
                opt => opt.MapFrom(src => src.Title ?? string.Empty))
            .ForMember(dest => dest.created_at,
                opt => opt.MapFrom(src => src.CreatedAt.ToString("O")))
            .ForMember(dest => dest.participantIds,
                opt => opt.MapFrom(src => src.Participants.Select(p => p.UserId)));
    }
}